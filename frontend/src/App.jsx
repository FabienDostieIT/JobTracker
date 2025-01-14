import React, { useState } from 'react';
import { FileSpreadsheet, Printer } from 'lucide-react';
import JobTracker from './components/JobTracker';
import PreferencesModal from './components/PreferencesModal';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const handleExport = () => {
    // TODO: Implémenter l'export
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-dark-text-primary">
        <header className="bg-gradient-to-r from-custom-blue-600 to-custom-blue-700 text-white shadow-lg dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Suivi des candidatures - JobTracker</h1>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Exporter
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  Imprimer
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <JobTracker />
        </main>

        {isPreferencesOpen && (
          <PreferencesModal onClose={() => setIsPreferencesOpen(false)} />
        )}
      </div>
    </ThemeProvider>
  );
}
