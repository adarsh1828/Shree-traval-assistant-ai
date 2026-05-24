import React, { useState, useMemo, useEffect } from 'react';
import { Plane, MapPin, Wallet, Calendar, Heart, FileText, Send, Loader2, Sparkles, MoveRight, ArrowLeft, CarFront, Home, ShieldAlert, Copy, Download, Check, Map, Sun, Moon, Compass } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';

const CheckboxItem = ({ initialChecked }: { initialChecked?: boolean }) => {
  const [isChecked, setIsChecked] = useState(initialChecked || false);
  return (
    <input 
      type="checkbox" 
      checked={isChecked} 
      onChange={(e) => setIsChecked(e.target.checked)} 
      className="mt-1.5 w-5 h-5 text-teal-600 bg-white border-2 border-slate-300 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer transition-colors checked:bg-teal-600 checked:border-teal-600 dark:bg-slate-800 dark:border-slate-600 print:appearance-none print:w-4 print:h-4 flex-shrink-0"
    />
  );
};

function App() {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    budget: '',
    days: '',
    nights: '',
    tripFocus: 'Any (Balanced)',
    interests: '',
    transportMode: 'Any (Best Recommended)',
    mealPreference: 'Any',
    roomType: 'Any',
  });

  const [itinerary, setItinerary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'form' | 'loading' | 'result'>('form');
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const estimatedCost = useMemo(() => {
    let dailyStay = 1500;
    if (formData.roomType === 'AC Room') dailyStay = 2500;
    else if (formData.roomType === 'Non-AC Room') dailyStay = 800;

    let dailyFood = 600;
    if (formData.mealPreference === 'Vegetarian Only') dailyFood = 500;
    else if (formData.mealPreference === 'Non-Vegetarian Preferred') dailyFood = 800;
    else if (formData.mealPreference === 'Vegan') dailyFood = 1200;

    let transport = 2000; 
    if (formData.transportMode === 'Train (Reserved/AC/Sleeper)') transport = 2500;
    else if (formData.transportMode === 'Train (General)') transport = 800;
    else if (formData.transportMode === 'Train') transport = 1500;
    else if (formData.transportMode === 'Bus') transport = 1000;
    else if (formData.transportMode === 'Rented Car') transport = 3000 * (Number(formData.days) || 1);
    else if (formData.transportMode === 'Private Car (Own / Diesel Cost)') transport = 2500;

    const days = Number(formData.days) || 0;
    const nights = Number(formData.nights) || 0;
    if (days === 0 && nights === 0) return 0;
    
    return (dailyStay * nights) + (dailyFood * days) + transport;
  }, [formData]);

  const budgetAmount = Number(formData.budget) || 0;
  const budgetPercentage = Math.min((estimatedCost / (budgetAmount || 1)) * 100, 100);
  const isOverBudget = estimatedCost > budgetAmount && budgetAmount > 0;

  const handleCopy = () => {
    if (itinerary) {
      const match = itinerary.match(/```(?:markdown)?\n([\s\S]*?)```/);
      const textToCopy = match ? match[1] : itinerary;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.origin || !formData.destination || !formData.budget || !formData.days || !formData.nights || !formData.interests) {
      setError('Please fill in all required fields to continue.');
      return;
    }
    
    if (isOverBudget) {
      setError('Your estimated cost exceeds the stated budget. Try adjusting some options.');
      return;
    }

    setLoading(true);
    setView('loading');
    setError(null);
    setItinerary(null);

    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate itinerary. Please try again.');
      }

      setItinerary(data.itinerary);
      setView('result');
    } catch (err: any) {
      setError(err.message);
      setView('form');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setView('form');
    setItinerary(null);
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 relative overflow-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-900/40 blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-emerald-300/20 dark:bg-emerald-900/30 blur-[100px] mix-blend-multiply dark:mix-blend-lighten animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-300/10 dark:bg-cyan-900/20 blur-[150px] mix-blend-multiply dark:mix-blend-lighten animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      <header className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 sticky top-0 z-50 shadow-sm print:hidden transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3.5 cursor-pointer group" 
            onClick={handleReset}
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-emerald-700 shadow-lg shadow-teal-500/30 dark:shadow-teal-900/40 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute inset-0 rounded-2xl bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Premium abstract Travel Monogram SVG */}
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white drop-shadow-md relative z-10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="currentColor" fillOpacity="0.2"/>
                <path d="M12 2L12 18L22 22L12 2Z" fill="currentColor"/>
                <circle cx="12" cy="14" r="2" fill="white" className="animate-pulse" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-serif font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 drop-shadow-sm leading-none">
                Shree
              </h1>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 flex items-center gap-1 mt-1 leading-none">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                AI Travel
              </p>
            </div>
          </motion.div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            title={isDarkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-grow w-full relative z-10">
        <AnimatePresence mode="wait">
          
          {view === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-800 p-8 md:p-12 relative overflow-hidden transition-colors duration-300"
            >
              <div className="mb-8 text-center border-b border-slate-100 dark:border-slate-700/50 pb-6 relative">
                <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100 dark:border-teal-800/50">
                  <Plane className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                  Plan Your Perfect Trip
                </h2>
                <p className="text-base text-slate-500 dark:text-slate-400">Tell us where you want to go, and let Shree handle the rest.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Origin */}
                  <div>
                    <label htmlFor="origin" className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium text-sm">Where from?</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="text"
                        id="origin"
                        name="origin"
                        value={formData.origin}
                        onChange={handleChange}
                        className="pl-11 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-3 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="e.g., Delhi"
                        required
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div>
                    <label htmlFor="destination" className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium text-sm">Where to?</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        className="pl-11 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-3 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="e.g., Jaipur"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div>
                    <label htmlFor="budget" className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium text-sm">Total Budget (INR)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-medium">
                        ₹
                      </div>
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="pl-9 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-3 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="e.g., 15000"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Days and Nights */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium text-sm">Duration (Days & Nights)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Sun className="w-4 h-4" />
                        </div>
                        <input
                          type="number"
                          id="days"
                          name="days"
                          value={formData.days}
                          onChange={handleChange}
                          className="pl-10 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-3 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          placeholder="Days"
                          min="1"
                          max="30"
                          required
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Moon className="w-4 h-4" />
                        </div>
                        <input
                          type="number"
                          id="nights"
                          name="nights"
                          value={formData.nights}
                          onChange={handleChange}
                          className="pl-10 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-3 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          placeholder="Nights"
                          min="0"
                          max="30"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Transport Mode */}
                  <div>
                    <label htmlFor="transportMode" className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium text-sm">Transport Mode</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <CarFront className="w-4 h-4" />
                      </div>
                      <select
                        id="transportMode"
                        name="transportMode"
                        value={formData.transportMode}
                        onChange={handleChange}
                        className="pl-10 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-3 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-900 dark:text-white outline-none appearance-none cursor-pointer"
                        required
                      >
                        <option value="Any (Best Recommended)">Any (Best Recommended)</option>
                        <option value="Train (Reserved/AC/Sleeper)">Train (Reserved/AC/Sleeper)</option>
                        <option value="Train (General)">Train (General)</option>
                        <option value="Bus">Bus</option>
                        <option value="Private Car (Own / Diesel Cost)">Private Car</option>
                        <option value="Rented Car">Rented Car</option>
                      </select>
                    </div>
                  </div>

                  {/* Meal Preference */}
                  <div>
                    <label htmlFor="mealPreference" className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium text-sm">Meal Preference</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Heart className="w-4 h-4" />
                      </div>
                      <select
                        id="mealPreference"
                        name="mealPreference"
                        value={formData.mealPreference}
                        onChange={handleChange}
                        className="pl-10 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-3 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-900 dark:text-white outline-none appearance-none cursor-pointer"
                        required
                      >
                        <option value="Any">Any Options</option>
                        <option value="Vegetarian Only">Vegetarian</option>
                        <option value="Non-Vegetarian Preferred">Non-Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Accomodation Preference */}
                  <div>
                    <label htmlFor="roomType" className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium text-sm">Accommodation Type</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Home className="w-4 h-4" />
                      </div>
                      <select
                        id="roomType"
                        name="roomType"
                        value={formData.roomType}
                        onChange={handleChange}
                        className="pl-11 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-3 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-900 dark:text-white outline-none appearance-none cursor-pointer"
                        required
                      >
                        <option value="Any">Best Available</option>
                        <option value="AC Room">AC Room</option>
                        <option value="Non-AC Room">Non-AC Room</option>
                      </select>
                    </div>
                  </div>

                  {/* Trip Focus */}
                  <div>
                    <label htmlFor="tripFocus" className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium text-sm">Theme & Special Focus</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Compass className="w-4 h-4" />
                      </div>
                      <select
                        id="tripFocus"
                        name="tripFocus"
                        value={formData.tripFocus}
                        onChange={handleChange}
                        className="pl-11 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-3 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-900 dark:text-white outline-none appearance-none cursor-pointer"
                        required
                      >
                        <option value="Any (Balanced)">Any (Balanced)</option>
                        <option value="Historical Exploration (Explain significance & budget)">History & Heritage</option>
                        <option value="Nature & Scenic Landscapes">Nature & Wildlife</option>
                        <option value="Adventure, Thrills & Activities">Adventure & Thrill</option>
                        <option value="Culture, Local Vibe & Religious Spots">Culture & Religion</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label htmlFor="interests" className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium text-sm">Specific Interests & Places to Focus</label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-400">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <textarea
                      id="interests"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      rows={3}
                      className="pl-11 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-3 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-900 dark:text-white outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder="e.g., Historical sites, local food, adventure sports..."
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Budget Tracker UI */}
                {(formData.days || formData.nights) && formData.budget && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg relative overflow-hidden"
                  >
                    <div className="flex justify-between items-end mb-3 text-sm">
                      <div className="text-slate-600 dark:text-slate-400 font-medium">Estimated Cost: <span className={`text-lg ${isOverBudget ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>₹{estimatedCost.toLocaleString('en-IN')}</span></div>
                      <div className="text-slate-600 dark:text-slate-400">Limit: <span className="font-medium text-slate-800 dark:text-slate-200">₹{budgetAmount.toLocaleString('en-IN')}</span></div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${budgetPercentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-teal-500'}`}
                      />
                    </div>
                    {isOverBudget && (
                      <p className="text-red-600 dark:text-red-400 mt-3 text-xs font-medium flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 p-2 rounded-md border border-red-100 dark:border-red-500/20">
                        <ShieldAlert className="w-4 h-4 shrink-0" /> Your estimated cost exceeds your budget. Consider adjusting transport, accommodation, or duration.
                      </p>
                    )}
                  </motion.div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 border border-red-100 dark:border-red-500/20 rounded-lg flex items-center gap-3 text-sm font-medium"
                    >
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || isOverBudget}
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-teal-900/20 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2 text-lg">
                      Generate Masterpiece Itinerary
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {view === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-800 p-12 h-full flex flex-col items-center justify-center min-h-[50vh] relative overflow-hidden"
            >
              <div className="relative mb-8">
                 <div className="w-24 h-24 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center border-2 border-teal-100 dark:border-teal-800/50 relative z-10">
                    <Loader2 className="w-12 h-12 text-teal-600 dark:text-teal-400 animate-spin" />
                 </div>
                 {/* Decorative rings */}
                 <div className="absolute inset-0 border border-teal-200 dark:border-teal-700/50 rounded-full animate-ping opacity-75"></div>
                 <div className="absolute -inset-4 border border-teal-100 dark:border-teal-800/30 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
              </div>

              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2 relative z-10">Crafting your perfect journey...</h2>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm relative z-10">
                Shree is analyzing the best roots, estimating accurate costs, and tailoring {formData.tripFocus.split(' ')[0].toLowerCase()} details for {formData.destination}.
              </p>
            </motion.div>
          )}

          {view === 'result' && itinerary && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <button 
                onClick={handleReset}
                className="group flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-medium text-sm print:hidden"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Plan another trip
              </button>
              
              <div className="bg-white dark:bg-slate-800/50 shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden flex flex-col relative print:border-none print:shadow-none print:bg-white">
                
                {/* Hero Header */}
                <div className="relative bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-900 dark:to-emerald-900 px-6 py-8 md:px-10 md:py-12 overflow-hidden print:bg-transparent print:p-0 print:mb-6">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl mix-blend-overlay"></div>
                  <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-teal-300/20 blur-3xl mix-blend-overlay"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
                    <div className="text-white">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-4 border border-white/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI-Generated Itinerary
                      </div>
                      <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-2 drop-shadow-sm flex items-center flex-wrap gap-3">
                        <span>{formData.destination}</span>
                      </h2>
                      <p className="text-teal-50 text-base md:text-lg font-medium flex items-center gap-2 opacity-90 drop-shadow-sm">
                        Trip starting from {formData.origin}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleCopy}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white transition-all flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={handlePrint}
                        className="px-4 py-2.5 bg-white text-teal-700 hover:bg-teal-50 backdrop-blur-md rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        Save PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-700 print:hidden">
                  <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <Wallet className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Budget</span>
                    </div>
                    <p className="text-slate-900 dark:text-white font-bold text-lg">₹{Number(formData.budget).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Duration</span>
                    </div>
                    <p className="text-slate-900 dark:text-white font-bold text-lg">{formData.days}D / {formData.nights}N</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <CarFront className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Transport</span>
                    </div>
                    <p className="text-slate-900 dark:text-white font-bold text-lg truncate" title={formData.transportMode}>{formData.transportMode.split(' ')[0]}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <Compass className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Theme</span>
                    </div>
                    <p className="text-slate-900 dark:text-white font-bold text-lg truncate" title={formData.tripFocus}>{formData.tripFocus.split(' ')[0]}</p>
                  </div>
                </div>
                
                <div className="p-6 md:p-10 relative print:p-0">
                  <div className="prose prose-slate dark:prose-invert prose-lg max-w-none 
                    prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                    prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-a:underline hover:prose-a:text-teal-700 dark:hover:prose-a:text-teal-300
                    prose-table:w-full prose-table:overflow-x-auto prose-table:text-sm prose-table:border-collapse
                    prose-th:bg-slate-50 dark:prose-th:bg-slate-800/80 prose-th:p-4 prose-th:text-left prose-th:border-b-2 prose-th:border-slate-200 dark:prose-th:border-slate-700 prose-th:font-semibold prose-th:uppercase prose-th:text-xs prose-th:tracking-wider prose-th:text-slate-500 dark:prose-th:text-slate-400
                    prose-td:p-4 prose-td:border-b prose-td:border-slate-100 dark:prose-td:border-slate-700/50
                    prose-pre:bg-slate-50 dark:prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-100 dark:prose-pre:border-slate-800 prose-pre:rounded-xl 
                    print:prose-pre:bg-transparent print:prose-pre:border-none print:prose-pre:shadow-none
                    print:prose-headings:text-black print:prose-p:text-slate-800 print:prose-th:bg-slate-100 print:prose-td:text-slate-800"
                  >
                    <Markdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        li: ({ node, children, ...props }: any) => {
                          if (props.className?.includes('task-list-item')) {
                            return <li className="flex items-start gap-3 my-2 list-none ml-0 pl-0 transition-opacity duration-300 has-[:checked]:opacity-50 has-[:checked]:line-through" {...props}>{children}</li>;
                          }
                          return <li {...props}>{children}</li>;
                        },
                        input: ({ node, checked, disabled, ...props }: any) => {
                          if (props.type === 'checkbox') {
                            return <CheckboxItem initialChecked={checked} />;
                          }
                          return <input {...props} />;
                        }
                      }}
                    >
                      {itinerary}
                    </Markdown>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
