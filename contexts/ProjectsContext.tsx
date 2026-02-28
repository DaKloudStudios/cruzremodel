import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, doc, addDoc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { Project, ProjectStatus } from '../types';

interface ProjectsContextType {
    projects: Project[];
    addProject: (project: Omit<Project, 'id' | 'status' | 'completionPercent' | 'tasks' | 'materialStatus' | 'changeOrders' | 'notes' | 'estimatedLaborHours' | 'expenses' | 'invoices'>) => Promise<void>;
    updateProjectStatus: (id: string, status: ProjectStatus) => void;
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const useProjects = () => {
    const context = useContext(ProjectsContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectsProvider');
    }
    return context;
};

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthorized, currentUser } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        if (!isAuthorized || !currentUser) {
            setProjects([]);
            return;
        }

        const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
            setProjects(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Project)));
        });

        return () => unsubProjects();
    }, [isAuthorized, currentUser]);

    const addProject = async (projectData: Omit<Project, 'id' | 'status' | 'completionPercent' | 'tasks' | 'materialStatus' | 'changeOrders' | 'notes' | 'estimatedLaborHours' | 'expenses' | 'invoices'>) => {
        let estimatedHours = 0;
        let initialMaterials: { estimateItemId: string, status: string, name?: string }[] = [];

        try {
            const estimateSnap = await getDoc(doc(db, 'estimates', projectData.estimateId));
            if (estimateSnap.exists()) {
                const linkedEstimate = estimateSnap.data();
                if (linkedEstimate.items && Array.isArray(linkedEstimate.items)) {
                    estimatedHours = linkedEstimate.items
                        .filter((i: any) => i.type === 'Labor')
                        .reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);

                    initialMaterials = linkedEstimate.items
                        .filter((i: any) => i.type === 'Material')
                        .map((i: any) => ({
                            estimateItemId: i.id || '',
                            status: 'Pending',
                            name: i.description // Extra field helpful for UI
                        }));
                }
            }
        } catch (e) {
            console.error("Failed to fetch linked estimate", e);
        }

        const newProject = {
            ...projectData,
            estimatedLaborHours: estimatedHours,
            status: 'Scheduled' as ProjectStatus,
            assignedCrewIds: projectData.assignedCrewIds || [], // Use the passed IDs or empty array
            completionPercent: 0,
            tasks: [
                { id: Math.random().toString(36), description: 'Site Walkthrough & Safety Check', isCompleted: false, priority: 'High' },
                { id: Math.random().toString(36), description: 'Material Verification', isCompleted: false, priority: 'Medium' },
                { id: Math.random().toString(36), description: 'Equipment Staging', isCompleted: false, priority: 'Medium' }
            ],
            materialStatus: initialMaterials,
            changeOrders: [],
            notes: [],
            expenses: [],
            invoices: []
        };
        await addDoc(collection(db, 'projects'), newProject);
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        await updateDoc(doc(db, 'projects', id), updates);
    };

    const updateProjectStatus = (id: string, status: ProjectStatus) => {
        updateProject(id, { status });
    };

    return (
        <ProjectsContext.Provider value={{ projects, addProject, updateProject, updateProjectStatus }}>
            {children}
        </ProjectsContext.Provider>
    );
};
