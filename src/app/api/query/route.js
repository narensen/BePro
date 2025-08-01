import { NextResponse } from 'next/server';

/**
 * Mission Query Endpoint
 * Handles QueryMission requests and returns structured responses
 */
export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { input, logs = '', history = '' } = body;

    // Validate input
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input provided' },
        { status: 400 }
      );
    }

    // Process the query with context awareness
    const response = await processQuery(input, logs, history);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Query processing error:', error);
    
    // Return fallback response on error
    return NextResponse.json({
      session: "I apologize, but I encountered an error processing your query. Please try again.",
      ide: "// Error occurred during code generation",
      logs: "Error: Failed to process query"
    });
  }
}

/**
 * Process user query with context awareness
 * Maintains Codex persona as sophisticated career pathing engine
 */
async function processQuery(userInput, previousLogs, chatHistory) {
  try {
    // Format the prompt with context
    const formattedPrompt = formatPromptWithContext(userInput, previousLogs, chatHistory);
    
    // Generate structured response
    const response = await generateCodexResponse(formattedPrompt, userInput);
    
    // Parse and structure the response
    return parseResponseStructure(response, previousLogs);
  } catch (error) {
    console.error('Error in processQuery:', error);
    throw error;
  }
}

/**
 * Format user prompt with context from logs and history
 */
function formatPromptWithContext(userInput, logs, history) {
  const contextPrompt = `
You are Codex, a sophisticated career pathing engine designed to guide users through their professional development journey.

Context from previous interactions:
${history ? `Previous conversation: ${history}` : 'No previous conversation.'}
${logs ? `Progress logs: ${logs}` : 'No previous progress logged.'}

Current user query: ${userInput}

Please provide a response that:
1. Maintains the professional, knowledgeable Codex persona
2. Addresses the user's specific question or request
3. Provides actionable guidance for their career development
4. Includes relevant code examples if applicable
5. Updates progress tracking as appropriate

Your response should be helpful, encouraging, and focused on advancing their learning journey.
`;

  return contextPrompt;
}

/**
 * Generate Codex response based on formatted prompt
 */
async function generateCodexResponse(prompt, originalInput) {
  // Since we don't have access to an external AI service in this implementation,
  // we'll create contextual responses based on common career development queries
  
  const inputLower = originalInput.toLowerCase();
  
  // Detect query type and generate appropriate response
  if (inputLower.includes('code') || inputLower.includes('programming') || inputLower.includes('function') || 
      inputLower.includes('sort') || inputLower.includes('array') || inputLower.includes('javascript') ||
      inputLower.includes('python') || inputLower.includes('java') || inputLower.includes('algorithm')) {
    return generateCodeResponse(originalInput);
  } else if (inputLower.includes('career') || inputLower.includes('job') || inputLower.includes('skill') ||
             inputLower.includes('interview') || inputLower.includes('resume') || inputLower.includes('portfolio')) {
    return generateCareerResponse(originalInput);
  } else if (inputLower.includes('learn') || inputLower.includes('study') || inputLower.includes('practice') ||
             inputLower.includes('tutorial') || inputLower.includes('course') || inputLower.includes('how')) {
    return generateLearningResponse(originalInput);
  } else {
    return generateGeneralResponse(originalInput);
  }
}

/**
 * Generate code-focused response
 */
function generateCodeResponse(input) {
  const inputLower = input.toLowerCase();
  let codeExample = "";
  let sessionMessage = "";
  
  if (inputLower.includes('sort') || inputLower.includes('array')) {
    sessionMessage = `Great question about array sorting! Let me provide you with multiple approaches to sort arrays in JavaScript, from basic to advanced techniques.`;
    codeExample = `// Array sorting examples
const numbers = [64, 34, 25, 12, 22, 11, 90];

// 1. Built-in sort method
const sortedNumbers = [...numbers].sort((a, b) => a - b);
console.log("Sorted:", sortedNumbers);

// 2. Custom bubble sort implementation
function bubbleSort(arr) {
    const result = [...arr];
    for (let i = 0; i < result.length - 1; i++) {
        for (let j = 0; j < result.length - i - 1; j++) {
            if (result[j] > result[j + 1]) {
                [result[j], result[j + 1]] = [result[j + 1], result[j]];
            }
        }
    }
    return result;
}

// 3. Quick sort implementation
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[0];
    const left = arr.slice(1).filter(x => x < pivot);
    const right = arr.slice(1).filter(x => x >= pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}

// Usage examples:
console.log("Bubble sort:", bubbleSort(numbers));
console.log("Quick sort:", quickSort(numbers));`;
  } else if (inputLower.includes('function')) {
    sessionMessage = `Excellent question about functions! Functions are fundamental building blocks in programming. Let me show you different function patterns and best practices.`;
    codeExample = `// Function examples and patterns

// 1. Function declaration
function greetUser(name) {
    return \`Hello, \${name}! Welcome to Codex.\`;
}

// 2. Arrow function
const calculateArea = (width, height) => width * height;

// 3. Function with default parameters
function createProfile(name, role = "Developer", experience = 0) {
    return {
        name,
        role,
        experience,
        skills: []
    };
}

// 4. Higher-order function
function withLogging(fn) {
    return function(...args) {
        console.log(\`Calling \${fn.name} with args:\`, args);
        const result = fn.apply(this, args);
        console.log(\`Result:\`, result);
        return result;
    };
}

// Usage examples:
console.log(greetUser("Developer"));
console.log("Area:", calculateArea(10, 5));

const profile = createProfile("Alex", "Frontend Developer", 2);
console.log("Profile:", profile);

const loggedGreet = withLogging(greetUser);
loggedGreet("Codex User");`;
  } else {
    sessionMessage = `Great question about coding! Let me help you with that. Based on your query about "${input}", I'll provide you with some guidance and practical code examples.`;
    codeExample = `// General programming example
class CareerDeveloper {
    constructor(name) {
        this.name = name;
        this.skills = [];
        this.projects = [];
        this.experience = 0;
    }
    
    addSkill(skill) {
        if (!this.skills.includes(skill)) {
            this.skills.push(skill);
            console.log(\`\${this.name} learned \${skill}!\`);
        }
    }
    
    completeProject(project) {
        this.projects.push({
            name: project,
            completedAt: new Date(),
            skillsUsed: this.skills.slice()
        });
        this.experience += 1;
        console.log(\`Project '\${project}' completed!\`);
    }
    
    getProfile() {
        return {
            name: this.name,
            skills: this.skills,
            projectCount: this.projects.length,
            experience: this.experience
        };
    }
}

// Usage example:
const developer = new CareerDeveloper("Alex");
developer.addSkill("JavaScript");
developer.addSkill("React");
developer.completeProject("Portfolio Website");

console.log("Developer Profile:", developer.getProfile());`;
  }

  return {
    session: sessionMessage,
    ide: codeExample,
    logs: "✓ Discussed coding concepts and provided example implementation"
  };
}

/**
 * Generate career-focused response
 */
function generateCareerResponse(input) {
  return {
    session: `Excellent career-related question! As your career pathing engine, I'm here to help you navigate your professional development. Regarding "${input}", let me provide some strategic guidance tailored to your journey.`,
    ide: `// Career development checklist
/*
Professional Development Plan:

1. Skill Assessment
   - Identify current strengths
   - Recognize areas for improvement
   - Set measurable goals

2. Learning Path
   - Choose relevant technologies
   - Practice consistently
   - Build portfolio projects

3. Network Building
   - Join professional communities
   - Attend industry events
   - Contribute to open source

4. Application Strategy
   - Optimize resume/portfolio
   - Practice technical interviews
   - Apply strategically
*/`,
    logs: "✓ Reviewed career development strategy and next steps"
  };
}

/**
 * Generate learning-focused response
 */
function generateLearningResponse(input) {
  return {
    session: `Perfect! Learning is at the core of career advancement. I'll help you create an effective learning strategy for "${input}". Let's break this down into actionable steps that will accelerate your progress.`,
    ide: `// Learning roadmap template
const learningPlan = {
    topic: "Your Learning Focus",
    duration: "Estimated timeline",
    phases: [
        {
            phase: "Foundation",
            activities: [
                "Understand core concepts",
                "Complete basic exercises",
                "Build simple projects"
            ]
        },
        {
            phase: "Practice", 
            activities: [
                "Work on intermediate projects",
                "Join coding challenges",
                "Collaborate with others"
            ]
        },
        {
            phase: "Mastery",
            activities: [
                "Build advanced projects",
                "Teach others",
                "Contribute to community"
            ]
        }
    ]
};`,
    logs: "✓ Created structured learning plan and defined milestones"
  };
}

/**
 * Generate general response
 */
function generateGeneralResponse(input) {
  return {
    session: `Thank you for your question! As Codex, I'm here to support your professional development journey. Regarding "${input}", I'll provide you with relevant guidance to help you progress in your career path.`,
    ide: `// General guidance framework
/*
Next Steps Framework:

1. Clarify your objective
   - Define specific goals
   - Identify success metrics
   - Set realistic timelines

2. Research and plan
   - Gather relevant information
   - Create actionable steps
   - Identify required resources

3. Execute and iterate
   - Start with small steps
   - Monitor progress regularly
   - Adjust approach as needed
*/`,
    logs: "✓ Provided general guidance and framework for progress"
  };
}

/**
 * Parse and structure the response into required format
 */
function parseResponseStructure(response, previousLogs) {
  try {
    // If response is already structured, validate and return
    if (response && typeof response === 'object' && response.session) {
      return {
        session: response.session || "I'm here to help with your career development!",
        ide: response.ide || "// Start coding here...",
        logs: response.logs || "✓ Query processed successfully"
      };
    }

    // If response is a string, try to parse it as JSON
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        return parseResponseStructure(parsed, previousLogs);
      } catch (parseError) {
        // If not JSON, treat as session message
        return {
          session: response,
          ide: "// Code examples will appear here based on your queries",
          logs: "✓ Processed text response"
        };
      }
    }

    // Fallback response
    return {
      session: "I'm ready to help you with your career development journey! What would you like to work on?",
      ide: "// Your code examples and exercises will appear here",
      logs: "✓ Ready to assist with your mission"
    };
  } catch (error) {
    console.error('Error parsing response structure:', error);
    
    // Return safe fallback
    return {
      session: "I encountered an issue parsing the response, but I'm still here to help!",
      ide: "// Error in response parsing",
      logs: "Error: Response parsing failed"
    };
  }
}