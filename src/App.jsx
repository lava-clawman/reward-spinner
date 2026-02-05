import { useState, useEffect } from 'react';
import Spinner from './components/Spinner';
import { SPINNERS, TIME_RULES } from './data/config';
import { Gift, Lock, CheckCircle, Trophy, Moon, Sun, Settings } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'reward_spinner_v1';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { inventory: [], specialTaskComplete: false };
  });
  const [showLoot, setShowLoot] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [testMode, setTestMode] = useState(false); // 测试模式：绕过时间限制
  
  // Persist Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  
  // Determine Active Mode
  let activeMode = 'sleep';
  let activeSpinnerId = null;

  if (hour >= TIME_RULES.morning.start && hour < TIME_RULES.morning.end) {
    activeMode = 'morning';
    activeSpinnerId = 'sparrow';
  } else if (hour >= TIME_RULES.evening.start && hour < TIME_RULES.evening.end) {
    activeMode = 'evening';
    activeSpinnerId = 'owl';
  } else {
    activeMode = 'sleep';
  }

  // Override logic: If special task is complete, Reward Spinner is available!
  // The user asked for "Reward Spinner - unlocks when special task complete".
  // Does it replace the current one? Or is it a separate tab?
  // Let's make it an option.
  
  const [selectedSpinnerId, setSelectedSpinnerId] = useState(activeSpinnerId || 'sparrow');

  // Sync selection with time if not manually overridden or viewing others
  useEffect(() => {
    if (activeSpinnerId && activeSpinnerId !== 'reward') {
      setSelectedSpinnerId(activeSpinnerId);
    }
  }, [activeMode]);

  const currentSpinnerConfig = SPINNERS[selectedSpinnerId];
  
  const isLocked = (() => {
    // 测试模式下不锁定任何转盘（除了奖励转盘仍需完成任务）
    if (testMode) {
      if (selectedSpinnerId === 'reward') return !data.specialTaskComplete;
      return false;
    }
    if (selectedSpinnerId === 'reward') return !data.specialTaskComplete;
    if (activeMode === 'sleep') return true;
    if (activeMode === 'morning' && selectedSpinnerId === 'owl') return true; // Owl only at night
    if (activeMode === 'evening' && selectedSpinnerId === 'sparrow') return false; // Can we spin sparrow at night? Spec says "Morning rewards accumulate to afternoon". Usually you spin in morning. Let's lock sparrow at night to encourage Owl.
    // Actually, spec says "Sparrow - Morning use". So lock it at night.
    if (activeMode === 'evening' && selectedSpinnerId === 'sparrow') return true;
    return false;
  })();

  const handleResult = (item) => {
    setData(prev => ({
      ...prev,
      inventory: [...prev.inventory, { ...item, earnedAt: new Date().toISOString(), spinner: selectedSpinnerId }],
      specialTaskComplete: selectedSpinnerId === 'reward' ? false : prev.specialTaskComplete // Reset task if reward spun? Usually yes.
    }));
  };

  const redeemItem = (index) => {
    setData(prev => ({
      ...prev,
      inventory: prev.inventory.filter((_, i) => i !== index)
    }));
  };

  const toggleSpecialTask = () => {
    setData(prev => ({ ...prev, specialTaskComplete: !prev.specialTaskComplete }));
  };
  
  const bgGradient = currentSpinnerConfig?.theme?.gradient || 'from-gray-800 to-gray-900';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-colors duration-1000 flex flex-col font-sans text-white overflow-hidden`}>
      
      {/* Header */}
      <header className="p-4 flex justify-between items-center z-10 backdrop-blur-sm bg-black/10">
        <div className="flex items-center gap-2">
          {activeMode === 'morning' ? <Sun className="text-yellow-300" /> : activeMode === 'evening' ? <Moon className="text-indigo-300" /> : <Moon className="text-gray-400" />}
          <span className="text-xl font-bold font-mono">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <button 
          onClick={() => setShowLoot(true)}
          className="relative bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all active:scale-95"
        >
          <Gift size={28} />
          {data.inventory.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
              {data.inventory.length}
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative p-4">
        
        {/* Spinner Selector Tabs */}
        <div className="absolute top-4 flex gap-2 p-1 bg-black/20 rounded-full backdrop-blur-md z-10">
          {Object.values(SPINNERS).map(spinner => (
            <button
              key={spinner.id}
              onClick={() => setSelectedSpinnerId(spinner.id)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-bold transition-all",
                selectedSpinnerId === spinner.id 
                  ? "bg-white text-gray-900 shadow-lg scale-105" 
                  : "text-white/70 hover:bg-white/10"
              )}
            >
              {spinner.name}
              {spinner.id === 'reward' && !data.specialTaskComplete && <Lock size={12} className="inline ml-1" />}
            </button>
          ))}
        </div>

        {/* The Spinner */}
        <div className="mt-12">
          <AnimatePresence mode='wait'>
            <motion.div
              key={selectedSpinnerId}
              initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-black text-center mb-8 drop-shadow-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                {currentSpinnerConfig.name}
              </h1>
              
              <div className="relative">
                {isLocked && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-full">
                    <Lock size={64} className="text-white/50 mb-4" />
                    <p className="text-xl font-bold text-center px-8">
                      {selectedSpinnerId === 'reward' 
                        ? "Complete a Special Task to Unlock!" 
                        : "Not available right now."}
                    </p>
                  </div>
                )}
                
                <Spinner 
                  items={currentSpinnerConfig.items} 
                  theme={currentSpinnerConfig.theme}
                  onResult={handleResult}
                  locked={isLocked}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Admin/Debug Corner */}
      <div className="fixed bottom-4 left-4 z-50">
        <button onClick={() => setShowAdmin(!showAdmin)} className="bg-white/20 p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity">
            <Settings size={20} />
        </button>
        {showAdmin && (
            <div className="bg-black/80 p-4 rounded mt-2 text-xs backdrop-blur-md border border-white/10">
                <p>Hour: {hour}</p>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={testMode} onChange={() => setTestMode(!testMode)} />
                    🧪 Test Mode (bypass time)
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={data.specialTaskComplete} onChange={toggleSpecialTask} />
                    Special Task Complete
                </label>
                <div className="mt-2 text-gray-400">
                    Use this to test spinners at any time.
                </div>
            </div>
        )}
      </div>

      {/* Inventory Modal */}
      <AnimatePresence>
        {showLoot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowLoot(false)}
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white text-gray-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy /> My Loot</h2>
                <button onClick={() => setShowLoot(false)} className="bg-white/20 p-1 rounded-full hover:bg-white/40">✕</button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {data.inventory.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Gift size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No rewards yet. Spin the wheel!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.inventory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div>
                          <p className="font-bold text-lg">{item.label}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{SPINNERS[item.spinner]?.name || 'Unknown'}</p>
                        </div>
                        <button 
                          onClick={() => redeemItem(idx)}
                          className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-md hover:bg-green-600 active:scale-95 transition-all"
                        >
                          USE
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
