import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Download, Trash2, X, Plus, Loader2 } from 'lucide-react';
import { useProjects } from '../contexts/ProjectsContext';
import { useAuth } from '../contexts/AuthContext';
import { companyCameraService } from '../services/companyCameraService';
import { ProjectImage } from '../types';

const CompanyCameraView: React.FC = () => {
    const { projects } = useProjects();
    const { currentUser, userRole } = useAuth();

    // Derived state for the view
    const isForeman = userRole === 'Foreman' || userRole === 'Laborer'; // Laborers act like Foremen here
    const isAdmin = !isForeman;

    // We only care about active/scheduled projects
    const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Scheduled');

    // UI State
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [images, setImages] = useState<ProjectImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Selected image for the modal gallery preview
    const [viewingImage, setViewingImage] = useState<ProjectImage | null>(null);

    // Hidden file input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load images when an admin selects a project
    useEffect(() => {
        if (!selectedProjectId) {
            setImages([]);
            return;
        }

        // Foremen don't need to load the gallery
        if (isForeman) return;

        const loadImages = async () => {
            setLoadingImages(true);
            try {
                const fetchedImages = await companyCameraService.getProjectImages(selectedProjectId);
                setImages(fetchedImages);
            } catch (error) {
                console.error("Failed to load images", error);
            } finally {
                setLoadingImages(false);
            }
        };

        loadImages();
    }, [selectedProjectId, isForeman]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!selectedProjectId) {
            alert("Please select a project first.");
            return;
        }

        const project = activeProjects.find(p => p.id === selectedProjectId);
        if (!project) return;

        // Ensure we have uploader info
        const uploaderName = currentUser?.displayName || 'Unknown User';
        const uploaderEmail = currentUser?.email || 'Unknown Email';

        try {
            setUploading(true);
            setUploadProgress(0);

            const newImage = await companyCameraService.uploadProjectImage(
                file,
                project.id,
                project.name,
                uploaderName,
                uploaderEmail,
                (p) => setUploadProgress(p)
            );

            // If Admin, append to gallery
            if (isAdmin) {
                setImages(prev => [newImage, ...prev]);
            } else {
                // If Foreman, just show a success message or let them upload another
                alert("Image uploaded successfully!");
            }

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (image: ProjectImage) => {
        if (!isAdmin) return;
        if (!confirm("Are you sure you want to delete this photo?")) return;

        try {
            await companyCameraService.deleteProjectImage(image.path);
            setImages(prev => prev.filter(img => img.id !== image.id));
            if (viewingImage?.id === image.id) {
                setViewingImage(null);
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete image.");
        }
    };

    const handleDownload = (image: ProjectImage) => {
        // Create an invisible link to trigger download
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `ProjectImage_${image.uploadDate}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- RENDER FOREMAN UI ---
    if (isForeman) {
        return (
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-2">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <Camera size={40} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-charcoal">Company Camera</h1>
                    <p className="text-slate-500">Capture and upload photos directly to your active projects.</p>
                </div>

                <div className="w-full bg-white rounded-3xl shadow-xl border border-cream-100 p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Project</label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full px-4 py-3 bg-cream-50 border-none rounded-2xl text-charcoal focus:ring-2 focus:ring-emerald-500 transition-all font-medium appearance-none"
                        >
                            <option value="">-- Choose a Project --</option>
                            {activeProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.clientName})</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4">
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment" // Suggests camera on mobile
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                            disabled={!selectedProjectId || uploading}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!selectedProjectId || uploading}
                            className={`w-full py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all ${!selectedProjectId
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                                }`}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={32} />
                                    <span>Uploading... {Math.round(uploadProgress)}%</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={32} />
                                    <span className="text-lg">Take or Upload Photo</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER ADMIN UI ---
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-charcoal tracking-tight flex items-center gap-3">
                        <Camera className="text-emerald-500" size={32} />
                        Company Camera
                    </h1>
                    <p className="text-slate-500 mt-1">Manage, download, and review project photos.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-cream-100">
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-64 px-4 py-2 bg-cream-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">Select a Project...</option>
                        {activeProjects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!selectedProjectId || uploading}
                        className="px-4 py-2 bg-charcoal text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Upload
                    </button>
                </div>
            </div>

            {/* Gallery Content */}
            {!selectedProjectId ? (
                <div className="bg-white rounded-[2rem] border border-cream-100 p-16 flex flex-col items-center justify-center text-center shadow-soft">
                    <div className="w-20 h-20 bg-cream-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <ImageIcon size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal mb-2">Select a Project</h3>
                    <p className="text-slate-500 max-w-sm">Choose a project from the dropdown above to view its photo gallery.</p>
                </div>
            ) : loadingImages ? (
                <div className="bg-white rounded-[2rem] border border-cream-100 p-16 flex flex-col items-center justify-center text-center">
                    <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Loading gallery...</p>
                </div>
            ) : images.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-cream-100 p-16 flex flex-col items-center justify-center text-center shadow-soft">
                    <div className="w-20 h-20 bg-cream-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <Camera size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal mb-2">No Photos Yet</h3>
                    <p className="text-slate-500 max-w-sm">This project doesn't have any uploaded photos. Use the upload button to add some.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map(img => (
                        <div
                            key={img.id}
                            onClick={() => setViewingImage(img)}
                            className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
                        >
                            <img src={img.url} alt="Project Photo" className="w-full h-full object-cover" loading="lazy" />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <p className="text-white text-xs font-medium truncate">{img.uploaderName}</p>
                                <p className="text-white/70 text-[10px]">{new Date(img.uploadDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Lightbox */}
            {viewingImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between p-4 text-white">
                        <div>
                            <p className="font-bold text-lg">{viewingImage.projectName}</p>
                            <p className="text-sm text-gray-400">
                                Uploaded by {viewingImage.uploaderName} on {new Date(viewingImage.uploadDate).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleDownload(viewingImage)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <Download size={24} />
                            </button>
                            <button
                                onClick={() => handleDelete(viewingImage)}
                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                            >
                                <Trash2 size={24} />
                            </button>
                            <button
                                onClick={() => setViewingImage(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div className="flex-1 flex items-center justify-center p-4 min-h-0">
                        <img
                            src={viewingImage.url}
                            alt="Full View"
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default CompanyCameraView;
