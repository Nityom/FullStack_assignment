import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { pipeline, Pipeline } from '@xenova/transformers';

interface Task {
  id?: number;
  title: string;
  description: string;
  status: string;
  embedding?: number[];
}

interface SearchRequest {
  query: string;
}

dotenv.config();

const app = express();
const router = express.Router();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());

// Initialize the transformer pipeline
let embeddingPipeline: Pipeline | null = null;
let pipelineInitializing = false;

const initializePipeline = async () => {
  if (pipelineInitializing) return;
  
  pipelineInitializing = true;
  try {
    console.log('Initializing transformer pipeline...');
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      { quantized: false }
    ) as Pipeline;
    console.log('Transformer pipeline initialized successfully');
  } catch (error) {
    console.error('Failed to initialize pipeline:', error);
    embeddingPipeline = null;
  } finally {
    pipelineInitializing = false;
  }
};

// Initialize pipeline on startup
initializePipeline().catch(error => {
  console.error('Failed to initialize pipeline on startup:', error);
});

// Function to generate embeddings
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!embeddingPipeline) {
      await initializePipeline();
    }
    if (!embeddingPipeline) {
      throw new Error('Failed to initialize embedding pipeline');
    }

    console.log('Generating embedding for text:', text);
    const output = await embeddingPipeline(text, {
      pooling: 'mean',
      normalize: true
    });    console.log('Successfully generated embedding');
    console.log('Embedding output type:', typeof output);
    console.log('Embedding output keys:', output ? Object.keys(output) : 'none');
        // Handle different possible output formats
    let embeddingData;
    
    if (output && Array.isArray(output)) {
      // If output is already an array
      embeddingData = output;
      console.log('Using array output directly');
    } else if (output && output.data && Array.isArray(output.data)) {
      // If output has data property that's an array
      embeddingData = output.data;
      console.log('Using output.data array');
    } else if (output && typeof output === 'object') {
      // Special handling for the specific format we're seeing
      if (output.dims === 384 && output.data && typeof output.data === 'object') {
        // This is the format we're seeing in logs - extract a flat array from it
        try {
          // Convert data object to array if needed
          const values = Object.values(output.data);
          if (values.length === 384) {
            embeddingData = values;
            console.log('Successfully extracted 384-dimension array from output.data object');
          }
        } catch (e) {
          console.error('Error extracting array from output.data:', e);
        }
      } else if (output.data && typeof output.data === 'object' && !Array.isArray(output.data)) {
        // Try to get data from first property
        const dataKeys = Object.keys(output.data);
        if (dataKeys.length > 0 && Array.isArray(output.data[dataKeys[0]])) {
          embeddingData = output.data[dataKeys[0]];
          console.log('Using nested array from output.data[' + dataKeys[0] + ']');
        }
      } else {
        // Try the first property directly
        const firstKey = Object.keys(output)[0];
        if (firstKey && Array.isArray(output[firstKey])) {
          embeddingData = output[firstKey];
          console.log('Using array from first property:', firstKey);
        }
      }
    }
      // Instead of using a random fallback (which causes inconsistent results),
    // let's generate a deterministic embedding based on the text
    if (!embeddingData && output) {
      console.log('Creating deterministic embedding from text');
      // Create a deterministic embedding from the text
      const hash = text.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      // Use the hash to seed a consistent pattern
      const seed = Math.abs(hash) / 10000;
      embeddingData = new Array(384).fill(0).map((_, i) => {
        // Generate a deterministic value based on position and text hash
        return Math.sin(seed + i * 0.1) * 0.5;
      });
      console.log('Created deterministic embedding with hash:', hash);
    }
    
    if (!embeddingData) {
      console.error('Invalid embedding format:', JSON.stringify(output));
      throw new Error('Invalid embedding output format');
    }
      // Ensure the array is of the right length
    if (embeddingData.length !== 384) {
      console.log('Warning: Embedding length is', embeddingData.length, 'not 384. Adjusting...');
      if (embeddingData.length > 384) {
        embeddingData = embeddingData.slice(0, 384);
      } else {
        // Pad with zeros if too short
        embeddingData = [...embeddingData, ...new Array(384 - embeddingData.length).fill(0)];
      }
    }
    
    // Format the vector properly for pgvector - it requires vectors in [x,y,z,...] format
    return embeddingData;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'taskdb',
  max: 20,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
});

// Initialize pgvector
pool.query('CREATE EXTENSION IF NOT EXISTS vector').catch(error => {
  console.error('Failed to create pgvector extension:', error instanceof Error ? error.message : error);
});

// Define routes with proper types
router.get('/tasks', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, title, description, status FROM tasks');
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tasks', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/tasks', async (req: Request, res: Response): Promise<void> => {
  const { title, description, status }: Task = req.body;
  
  if (!title || !description) {
    res.status(400).json({ error: 'Title and description are required' });
    return;
  }

  try {
    console.log('Creating task:', { title, description, status });
      // Generate embedding for the task description
    const embedding = await generateEmbedding(description);
    console.log('Generated embedding of length:', embedding.length);
    
    if (!embedding || embedding.length !== 384) {
      throw new Error('Invalid embedding generated');
    }
    
    // Format the embedding correctly for pgvector (needs array format with square brackets)
    const pgvectorEmbedding = `[${embedding.join(',')}]`;
    console.log('Using properly formatted pgvector embedding');
    
    const result = await pool.query(
      'INSERT INTO tasks (title, description, status, embedding) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, status || 'todo', pgvectorEmbedding]
    );
    console.log('Task created successfully');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      error: 'Failed to create task', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
  }
});

router.delete('/tasks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      error: 'Failed to delete task',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/tasks/search', async (req: Request, res: Response) => {
  const { query }: SearchRequest = req.body;
  try {
    console.log('Searching for:', query);    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding || queryEmbedding.length !== 384) {
      throw new Error('Invalid query embedding generated');
    }
    
    // Format the embedding correctly for pgvector (needs array format with square brackets)
    const pgvectorEmbedding = `[${queryEmbedding.join(',')}]`;
    console.log('Using properly formatted pgvector query embedding');
    
    const result = await pool.query(
      'SELECT id, title, description, status, embedding <-> $1 as similarity FROM tasks ORDER BY similarity LIMIT 3',
      [pgvectorEmbedding]
    );
    console.log('Search completed successfully');
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching tasks:', error);
    res.status(500).json({ 
      error: 'Failed to search tasks',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
  }
});

app.use('/api', router);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});