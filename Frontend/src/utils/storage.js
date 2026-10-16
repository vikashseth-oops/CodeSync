const USER_KEY = 'codesync_username';
const USER_ID_KEY = 'codesync_userid';
const RECENT_PROJECTS_KEY = 'codesync_recent_projects';
const SETTINGS_KEY = 'codesync_editor_settings';

export function getStoredUser() {
  const name = localStorage.getItem(USER_KEY) || '';
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id && name) {
    id = 'user_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(USER_ID_KEY, id);
  }
  return { name, id };
}

export function saveStoredUser(name, id) {
  if (name) {
    localStorage.setItem(USER_KEY, name.trim());
    const userId = id || 'user_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(USER_ID_KEY, userId);
    return { name: name.trim(), id: userId };
  }
  return { name: '', id: '' };
}

export function getRecentProjects() {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read recent projects:', err);
    return [];
  }
}

export function addRecentProject(project) {
  if (!project || !project.id) return;
  try {
    const current = getRecentProjects();
    const filtered = current.filter(p => p.id !== project.id);
    const updated = [
      {
        id: project.id,
        name: project.name || 'Untitled Project',
        description: project.description || '',
        owner: project.owner || 'Anonymous',
        isOwner: project.isOwner ?? false,
        language: project.language || 'javascript',
        lastOpened: new Date().toISOString()
      },
      ...filtered
    ].slice(0, 15);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save recent project:', err);
  }
}

export function removeRecentProject(projectId) {
  try {
    const current = getRecentProjects();
    const updated = current.filter(p => p.id !== projectId);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to remove recent project:', err);
    return [];
  }
}

export function getEditorSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {
      fontSize: 14,
      tabSize: 2,
      minimap: true,
      wordWrap: 'on',
      autoSave: true,
      theme: 'vs-dark'
    };
  } catch {
    return {
      fontSize: 14,
      tabSize: 2,
      minimap: true,
      wordWrap: 'on',
      autoSave: true,
      theme: 'vs-dark'
    };
  }
}

export function saveEditorSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
