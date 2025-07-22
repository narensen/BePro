export default function parseTaggedResponse(payload) {
    
  console.log('Parsing payload:', typeof payload, payload);
  
  if (typeof payload === 'object' && payload !== null) {
    if (payload.missions) return payload.missions;
    if (Object.keys(payload).some(k => /^\d+$/.test(k))) return payload;
    payload = JSON.stringify(payload);
  }

  if (typeof payload !== 'string') return {};

  let cleaned = payload.trim(); 

  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }

  cleaned = cleaned.replace(/^```[\w]*\s*/i, '');
  cleaned = cleaned.replace(/```\s*$/i, '');

  cleaned = cleaned.replace(/\\"/g, '"');
  cleaned = cleaned.replace(/\\'/g, "'");

  const missions = {};
  
  const missionRegex = /.*?<MISSION_(\d+)>\s*([\s\S]*?)\s*<\/MISSION_\1>.*/gi;

  const flexibleRegex = /<MISSION_(\d+)>([\s\S]*?)<\/MISSION_\1>/gi;
  let match;
  let foundAny = false;

  flexibleRegex.lastIndex = 0;
  
  while ((match = flexibleRegex.exec(cleaned)) !== null) {
    foundAny = true;
    const missionNumber = match[1];
    const content = match[2].trim();
    
    console.log(`Found mission ${missionNumber}:`, content.substring(0, 50) + '...');
    
    const titleMatch = content.match(/Title:\s*(.+?)(?:\n|Description:|$)/i);
    const descriptionMatch = content.match(/Description:\s*([\s\S]*?)(?:\n\n(?:Key Objectives:|<)|$)/i);
    
    const title = titleMatch ? titleMatch[1].trim() : `Mission ${missionNumber}`;
    let description = descriptionMatch ? descriptionMatch[1].trim() : content;
    
    description = description
      .replace(/\\n/g, '\n')
      .replace(/\\\\/g, '\\')
      .trim();
    
    missions[missionNumber] = {
      title: title,
      content: description
    };
  }

  if (foundAny) {
    console.log('Successfully parsed missions:', Object.keys(missions));
    return missions;
  }

  console.log('Regex approach failed, trying manual parsing...');

  const lines = cleaned.split('\n');
  let currentMission = null;
  let currentContent = [];
  
  for (const line of lines) {
    const missionStart = line.match(/<MISSION_(\d+)>/);
    const missionEnd = line.match(/<\/MISSION_(\d+)>/);
    
    if (missionStart) {

      if (currentMission && currentContent.length > 0) {
        const fullContent = currentContent.join('\n').trim();
        const titleMatch = fullContent.match(/Title:\s*(.+?)(?:\n|Description:|$)/i);
        const descriptionMatch = fullContent.match(/Description:\s*([\s\S]*?)(?:\n\n(?:Key Objectives:|<)|$)/i);
        
        missions[currentMission] = {
          title: titleMatch ? titleMatch[1].trim() : `Mission ${currentMission}`,
          content: descriptionMatch ? descriptionMatch[1].trim().replace(/\\n/g, '\n') : fullContent
        };
      }
      
      currentMission = missionStart[1];
      currentContent = [];
    } else if (missionEnd) {

      if (currentMission && currentContent.length > 0) {
        const fullContent = currentContent.join('\n').trim();
        const titleMatch = fullContent.match(/Title:\s*(.+?)(?:\n|Description:|$)/i);
        const descriptionMatch = fullContent.match(/Description:\s*([\s\S]*?)(?:\n\n(?:Key Objectives:|<)|$)/i);
        
        missions[currentMission] = {
          title: titleMatch ? titleMatch[1].trim() : `Mission ${currentMission}`,
          content: descriptionMatch ? descriptionMatch[1].trim().replace(/\\n/g, '\n') : fullContent
        };
      }
      currentMission = null;
      currentContent = [];
    } else if (currentMission) {
      currentContent.push(line);
    }
  }
  
  console.log('Manual parsing result:', Object.keys(missions));
  return missions;
}