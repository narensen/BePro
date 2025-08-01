// API utility for communicating with the Python backend
const BACKEND_URL = 'https://bepro-codex.onrender.com';

export async function queryAI({ input, mission, logs = '', history = '' }) {
  try {
    const response = await fetch(`${BACKEND_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        mission,
        logs,
        history
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        session: data.session || '',
        ide: data.ide || '',
        logs: data.logs || ''
      }
    };
  } catch (error) {
    console.error('Error querying AI:', error);
    return {
      success: false,
      error: error.message,
      data: {
        session: 'Sorry, I encountered an error. Please try again.',
        ide: '',
        logs: ''
      }
    };
  }
}