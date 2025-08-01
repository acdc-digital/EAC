// Twitter Agent Tools - ES Module version for Next.js compatibility

// Simple content generator
export const contentGenerator = {
  generateContent: async (request) => {
    const { userInput } = request;
    
    // Detect if user wants content generation or is providing literal content
    const isGenerationRequest = userInput.toLowerCase().includes('write') || 
                                userInput.toLowerCase().includes('create') ||
                                userInput.toLowerCase().includes('generate');
    
    if (!isGenerationRequest) {
      return {
        content: userInput,
        detectedTopic: 'user-provided',
        style: 'custom',
        confidence: 1.0
      };
    }

    // Extract topic from input
    const topic = userInput.replace(/write|create|generate|a post about|about/gi, '').trim();
    
    // Generate engaging content based on topic
    const templates = [
      `Just discovered something amazing about ${topic}! 🌟 The little details that make all the difference... #${topic.replace(/\s+/g, '')} #discovery`,
      `${topic} never fails to surprise me! There's always something new to learn and appreciate. What's your favorite thing about ${topic}? 🤔`,
      `Taking a moment to appreciate ${topic} today. Sometimes the simplest things bring the most joy! ✨ #gratitude #${topic.replace(/\s+/g, '')}`,
      `Fun fact about ${topic}: it's more fascinating than you might think! Here's what caught my attention... 🧠 #funfacts #${topic.replace(/\s+/g, '')}`,
      `${topic} is having a moment, and I'm here for it! 🙌 What trends are you noticing? #trending #${topic.replace(/\s+/g, '')}`
    ];
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      content: randomTemplate,
      detectedTopic: topic,
      style: 'engaging',
      confidence: 0.85
    };
  }
};

// Simple file namer
export const fileNamer = {
  generateFileName: (options) => {
    const { topic, style } = options;
    const date = new Date().toISOString().slice(0, 10);
    const randomId = Math.random().toString(36).substring(2, 8);
    
    const cleanTopic = topic.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const name = `${cleanTopic}-${style}-${date}-${randomId}`;
    
    return {
      name: name,
      isUnique: true,
      originalAttempt: name
    };
  }
};

// Simple project manager
export const projectManager = {
  selectProject: async (options) => {
    const { suggestedProject, contentTopic } = options;
    
    if (suggestedProject) {
      return {
        projectName: suggestedProject,
        isNewProject: false,
        matchConfidence: 0.9,
        reason: 'User specified project'
      };
    }
    
    // Smart project selection based on topic
    const socialMediaTopics = ['twitter', 'social', 'post', 'engagement'];
    const isSocialMedia = socialMediaTopics.some(topic => 
      contentTopic.toLowerCase().includes(topic)
    );
    
    if (isSocialMedia) {
      return {
        projectName: 'Social Media Campaign',
        isNewProject: false,
        matchConfidence: 0.8,
        reason: 'Content matches social media pattern'
      };
    }
    
    return {
      projectName: 'Content Creation',
      isNewProject: true,
      matchConfidence: 0.7,
      reason: 'New project for creative content'
    };
  }
};

// Main processor function
export async function processTwitterRequest(request, editorStoreState) {
  try {
    console.log("🔧 [ADVANCED TOOLS] Processing Twitter request:", request);
    
    // Step 1: Generate content
    const content = await contentGenerator.generateContent({
      userInput: request.userInput,
      includeHashtags: true
    });
    
    console.log("📝 [ADVANCED TOOLS] Generated content:", content);

    // Step 2: Generate filename
    const fileName = fileNamer.generateFileName({
      content: content.content,
      topic: content.detectedTopic,
      style: content.style,
      maxWords: 3
    });
    
    console.log("📁 [ADVANCED TOOLS] Generated filename:", fileName);

    // Step 3: Select project
    const project = await projectManager.selectProject({
      suggestedProject: request.suggestedProject,
      contentTopic: content.detectedTopic,
      contentStyle: content.style,
      userPreferences: {
        autoCreateProjects: true
      }
    });
    
    console.log("📂 [ADVANCED TOOLS] Selected project:", project);

    return {
      content,
      fileName,
      project,
      success: true,
      message: 'Twitter request processed successfully with ADVANCED TOOLS! 🚀'
    };
  } catch (error) {
    console.error("❌ [ADVANCED TOOLS] Error in processing:", error);
    return {
      content: { content: request.userInput, detectedTopic: 'error', style: 'error', confidence: 0 },
      fileName: { name: 'error-post', isUnique: false, originalAttempt: 'error' },
      project: { projectName: 'Social Media', isNewProject: false, matchConfidence: 0, reason: 'Error fallback' },
      success: false,
      message: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
