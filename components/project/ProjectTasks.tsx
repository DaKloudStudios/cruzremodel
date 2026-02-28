
import React, { useState } from 'react';
import { Project, ProjectTask } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import { CheckSquare, Plus, Trash2, Calendar, User, Flag, CheckCircle2, Circle } from 'lucide-react';

interface ProjectTasksProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ project, onUpdate }) => {
  const { settings } = useSettings();
  const [newTaskDesc, setNewTaskDesc] = useState('');
  
  // SAFETY: Ensure tasks array exists
  const currentTasks = project.tasks || [];

  const handleAddTask = () => {
      if (!newTaskDesc.trim()) return;
      const newTask: ProjectTask = {
          id: Math.random().toString(36).substr(2, 9),
          description: newTaskDesc,
          isCompleted: false,
          priority: 'Medium'
      };
      
      const updatedTasks = [...currentTasks, newTask];
      onUpdate({ 
          tasks: updatedTasks,
          completionPercent: updatedTasks.length > 0 ? Math.round((updatedTasks.filter(t => t.isCompleted).length / updatedTasks.length) * 100) : 0
      });
      setNewTaskDesc('');
  };

  const toggleTask = (taskId: string) => {
      const updatedTasks = currentTasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
      const percent = updatedTasks.length > 0 ? Math.round((updatedTasks.filter(t => t.isCompleted).length / updatedTasks.length) * 100) : 0;
      onUpdate({ tasks: updatedTasks, completionPercent: percent });
  };

  const deleteTask = (taskId: string) => {
      const updatedTasks = currentTasks.filter(t => t.id !== taskId);
      const percent = updatedTasks.length > 0 ? Math.round((updatedTasks.filter(t => t.isCompleted).length / updatedTasks.length) * 100) : 0;
      onUpdate({ tasks: updatedTasks, completionPercent: percent });
  };

  // Grouping Logic (Mock Phase for now, usually would be a property on task)
  // We'll treat the first 1/3 as "Prep", middle as "Execution", last as "Finish"
  const total = currentTasks.length;
  const prepTasks = currentTasks.slice(0, Math.ceil(total / 3));
  const execTasks = currentTasks.slice(Math.ceil(total / 3), Math.ceil(total * 2 / 3));
  const finishTasks = currentTasks.slice(Math.ceil(total * 2 / 3));

  const renderTaskGroup = (title: string, tasks: ProjectTask[]) => {
      if(tasks.length === 0 && title !== 'Phase 1: Mobilization') return null;
      
      const completed = tasks.filter(t => t.isCompleted).length;
      const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

      return (
          <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{title}</h4>
                  <span className="text-xs text-slate-400 font-mono">{completed}/{tasks.length}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              
              <div className="space-y-2">
                  {tasks.map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => toggleTask(task.id)}
                        className={`group flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                            task.isCompleted 
                            ? 'bg-slate-50 border-slate-100' 
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                          <div className={`mr-4 mt-0.5 ${task.isCompleted ? 'text-green-500' : 'text-slate-300 group-hover:text-blue-400'}`}>
                              {task.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                          </div>
                          
                          <div className="flex-1">
                              <p className={`text-sm font-medium transition-colors ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                  {task.description}
                              </p>
                              {task.assigneeId && (
                                  <div className="flex items-center mt-2 text-xs text-slate-500">
                                      <User size={12} className="mr-1"/> 
                                      {settings.employees.find(e => e.id === task.assigneeId)?.name || 'Unknown'}
                                  </div>
                              )}
                          </div>

                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                            className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
                  {tasks.length === 0 && (
                      <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
                          No tasks in this phase.
                      </div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
        
        {/* Input Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
                <input 
                    className="w-full p-4 pr-12 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Add a new task..."
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button 
                    onClick={handleAddTask}
                    className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>

        {/* Task Lists */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {currentTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <CheckSquare size={48} className="mb-4 opacity-10"/>
                    <p>No tasks yet. Add one to get started.</p>
                </div>
            ) : (
                <>
                    {renderTaskGroup('Phase 1: Mobilization & Prep', prepTasks)}
                    {renderTaskGroup('Phase 2: Execution', execTasks)}
                    {renderTaskGroup('Phase 3: Finish & Closeout', finishTasks)}
                </>
            )}
        </div>
    </div>
  );
};

export default ProjectTasks;
