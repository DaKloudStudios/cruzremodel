import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { ProjectImage } from '../types';

export const companyCameraService = {
    /**
     * Uploads an image to Firebase Storage and returns the ProjectImage metadata object.
     * Path: company_camera/{projectId}/{timestamp}_{filename}
     */
    uploadProjectImage: async (
        file: File,
        projectId: string,
        projectName: string,
        uploaderName: string,
        uploaderEmail: string,
        onProgress?: (progress: number) => void
    ): Promise<ProjectImage> => {
        return new Promise((resolve, reject) => {
            const timestamp = new Date().getTime();
            const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const storagePath = `company_camera/${projectId}/${timestamp}_${safeFilename}`;
            const storageRef = ref(storage, storagePath);

            // Metadata to help identify the image later
            const metadata = {
                customMetadata: {
                    projectId,
                    projectName,
                    uploaderName,
                    uploaderEmail,
                    uploadDate: new Date().toISOString()
                }
            };

            const uploadTask = uploadBytesResumable(storageRef, file, metadata);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    console.error("Error uploading image:", error);
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                        const imageRecord: ProjectImage = {
                            id: storagePath, // Use path as unique ID since we don't have a DB store for these
                            projectId,
                            projectName,
                            uploaderName,
                            uploaderEmail,
                            uploadDate: metadata.customMetadata.uploadDate,
                            url: downloadURL,
                            path: storagePath
                        };

                        resolve(imageRecord);
                    } catch (err) {
                        console.error("Error getting download URL:", err);
                        reject(err);
                    }
                }
            );
        });
    },

    /**
     * Fetches all images for a specific project by listing them in its storage folder.
     * Requires retrieving metadata for each item to populate the ProjectImage interface.
     */
    getProjectImages: async (projectId: string): Promise<ProjectImage[]> => {
        try {
            const folderRef = ref(storage, `company_camera/${projectId}`);
            const res = await listAll(folderRef);

            const images: ProjectImage[] = await Promise.all(
                res.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);

                    // Get metadata if we need the uploader name, etc, but we'll try to get it. 
                    // Note: FullMetadata isn't strictly typed to have customMetadata so we cast.
                    let uploaderName = "Unknown";
                    let uploaderEmail = "Unknown";
                    let uploadDate = new Date(0).toISOString(); // Default old date
                    let projectName = "Unknown Project";

                    try {
                        // In Firebase JS SDK v9+, getMetadata is a separate function. 
                        // To keep this clean for now, we'll import it dynamically or just rely on the naming constraint.
                        // Wait, getMetadata from 'firebase/storage' can be used. Let's add it.
                        const { getMetadata } = await import('firebase/storage');
                        const meta = await getMetadata(itemRef);
                        if (meta.customMetadata) {
                            uploaderName = meta.customMetadata.uploaderName || "Unknown";
                            uploaderEmail = meta.customMetadata.uploaderEmail || "Unknown";
                            uploadDate = meta.customMetadata.uploadDate || meta.timeCreated || uploadDate;
                            projectName = meta.customMetadata.projectName || "Unknown Project";
                        }
                    } catch (metaErr) {
                        console.warn("Could not fetch metadata for", itemRef.fullPath);
                    }

                    return {
                        id: itemRef.fullPath,
                        projectId,
                        projectName,
                        uploaderName,
                        uploaderEmail,
                        uploadDate,
                        url,
                        path: itemRef.fullPath
                    };
                })
            );

            // Sort newest first
            return images.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        } catch (err) {
            console.error(`Error fetching images for project ${projectId}:`, err);
            // It's possible the folder doesn't exist yet, which throws an error we can ignore
            return [];
        }
    },

    /**
     * Deletes an image from storage using its path
     */
    deleteProjectImage: async (imagePath: string): Promise<void> => {
        try {
            const imageRef = ref(storage, imagePath);
            await deleteObject(imageRef);
        } catch (error) {
            console.error("Error deleting image:", error);
            throw error;
        }
    }
};
