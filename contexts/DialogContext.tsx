import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertTriangle, Info, CheckCircle, HelpCircle } from 'lucide-react';

type DialogType = 'danger' | 'info' | 'success' | 'warning';

interface DialogOptions {
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useConfirm must be used within a DialogProvider');
  return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({ title: '', message: '' });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: DialogOptions) => {
    setOptions({
        type: 'danger', 
        confirmText: 'Confirm', 
        cancelText: 'Cancel', 
        ...opts
    });
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleClose = (result: boolean) => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(result);
      setResolvePromise(null);
    }
  };

  // --- ICON HELPER ---
  const getIcon = () => {
      switch(options.type) {
          case 'danger': 
            return <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"><AlertTriangle className="h-6 w-6 text-red-600" /></div>;
          case 'success': 
            return <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10"><CheckCircle className="h-6 w-6 text-emerald-600" /></div>;
          case 'info': 
            return <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"><Info className="h-6 w-6 text-blue-600" /></div>;
          default: 
            return <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10"><HelpCircle className="h-6 w-6 text-amber-600" /></div>;
      }
  };

  // --- BUTTON COLOR HELPER ---
  const getConfirmButtonClass = () => {
      switch(options.type) {
          case 'danger': return 'bg-red-600 hover:bg-red-500 ring-red-500';
          case 'success': return 'bg-emerald-600 hover:bg-emerald-500 ring-emerald-500';
          case 'info': return 'bg-blue-600 hover:bg-blue-500 ring-blue-500';
          default: return 'bg-slate-800 hover:bg-slate-700 ring-slate-700';
      }
  };

  return (
    <DialogContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && (
        <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"></div>

            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    {/* Modal Panel */}
                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-in zoom-in-95 fade-in duration-200 border border-stone-200">
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                {getIcon()}
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <h3 className="text-lg font-bold leading-6 text-slate-900 font-serif" id="modal-title">{options.title}</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-slate-500 whitespace-pre-line leading-relaxed">{options.message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-stone-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-stone-100">
                            <button 
                                type="button" 
                                className={`inline-flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-sm ring-1 ring-inset sm:ml-3 sm:w-auto transition-all ${getConfirmButtonClass()}`}
                                onClick={() => handleClose(true)}
                            >
                                {options.confirmText}
                            </button>
                            <button 
                                type="button" 
                                className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-all"
                                onClick={() => handleClose(false)}
                            >
                                {options.cancelText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
