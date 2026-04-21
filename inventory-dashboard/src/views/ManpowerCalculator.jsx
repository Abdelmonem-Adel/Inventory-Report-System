import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calculator, Package, Clock, Info, ChevronDown, Check } from 'lucide-react';
import { MANPOWER_RATES, WORKING_HOURS_PER_DAY } from '../constants/manpowerRates';
import SectionCard from '../components/ui/SectionCard';

const ManpowerCalculator = () => {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['All']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [data, setData] = useState(
    MANPOWER_RATES.reduce((acc, curr) => {
      acc[curr.category] = { qtyNeeded: '', manpower: '' };
      return acc;
    }, {})
  );

  const calculateManpower = (qtyNeeded, pickingPerDay) => {
    if (!qtyNeeded || qtyNeeded <= 0) return 0;
    return Math.ceil(qtyNeeded / pickingPerDay);
  };

  const calculateQtyPicked = (manpower, pickingPerDay) => {
    if (!manpower || manpower <= 0) return 0;
    return manpower * pickingPerDay;
  };

  const categoriesList = useMemo(() => ['All', ...MANPOWER_RATES.map(item => item.category)], []);

  const filteredCategories = useMemo(() => {
    return MANPOWER_RATES.filter(item => {
      const matchesSearch = item.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategories.includes('All') || selectedCategories.includes(item.category);
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategories]);

  const totals = useMemo(() => {
    return filteredCategories.reduce((acc, item) => {
      const manpowerCalc = calculateManpower(data[item.category].qtyNeeded, item.pickingPerDay);
      const manpowerNeeded = Math.max(0, manpowerCalc - item.avaliablePickers);
      const qtyPicked = calculateQtyPicked(data[item.category].manpower, item.pickingPerDay);

      return {
        availablePickers: acc.availablePickers + (item.avaliablePickers || 0),
        manpower: acc.manpower + manpowerCalc,
        manpowerNeeded: acc.manpowerNeeded + manpowerNeeded,
        qtyPicked: acc.qtyPicked + qtyPicked
      };
    }, { availablePickers: 0, manpower: 0, manpowerNeeded: 0, qtyPicked: 0 });
  }, [filteredCategories, data]);


  const handleInputChange = (category, field, value) => {
    if (value !== '' && isNaN(value)) return;
    setData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const toggleCategory = (category) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
    } else {
      let newSelected = selectedCategories.filter(c => c !== 'All');
      if (newSelected.includes(category)) {
        newSelected = newSelected.filter(c => c !== category);
        if (newSelected.length === 0) newSelected = ['All'];
      } else {
        newSelected.push(category);
      }
      setSelectedCategories(newSelected);
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.category-select-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-8xl mx-auto">
      <SectionCard
        title="Picking Manpower Calculator"
        icon={<Calculator size={22} className="text-indigo-600" />}
        color="indigo"
        headerActions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Multi-select Dropdown */}
            <div className="relative category-select-container w-64">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all text-left"
              >
                <span className="truncate">
                  {selectedCategories.includes('All') ? 'All Categories' : `${selectedCategories.length} Selected`}
                </span>
                <ChevronDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                  <div className="p-1">
                    {categoriesList.map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategories.includes(cat) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                          }`}>
                          {selectedCategories.includes(cat) && <Check size={10} className="text-white" />}
                        </div>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search category name..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        }
      >
        {/* Table Container with fixed height and scroll */}
        <div className="relative overflow-hidden rounded-xl border border-gray-100">
          <div className="max-h-[550px] overflow-y-scroll custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="bg-gray-50/80 backdrop-blur-sm shadow-sm">
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Category</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Available Pickers</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rate/Hr</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Rate/Day</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-yellow-50/40 text-yellow-700 text-center">QTY Needed</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-green-50/40 text-green-700 text-center">Manpower</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-indigo-50/40 text-indigo-700 text-center">Manpower Needed</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-yellow-50/40 text-yellow-700 text-center">Manpower Input</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-green-50/40 text-green-700 text-center">QTY Picked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCategories.map((item) => (
                  <tr key={item.category} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-gray-700 text-sm whitespace-nowrap">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                        {item.avaliablePickers.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                        {item.pickingPerHour.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {item.pickingPerDay.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-6 py-4 bg-yellow-50/10">
                      <div className="flex justify-center">
                        <input
                          type="text"
                          placeholder="0"
                          className="w-24 px-3 py-1.5 bg-white border border-yellow-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all font-bold text-gray-700 shadow-sm"
                          value={data[item.category].qtyNeeded}
                          onChange={(e) => handleInputChange(item.category, 'qtyNeeded', e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 bg-green-50/10 text-center">
                      <span className={`text-sm font-bold ${data[item.category].qtyNeeded ? 'text-green-600' : 'text-gray-300'}`}>
                        {calculateManpower(data[item.category].qtyNeeded, item.pickingPerDay)}
                      </span>
                    </td>
                    <td className="px-6 py-4 bg-indigo-50/10 text-center">
                      <span className={`text-sm font-bold ${calculateManpower(data[item.category].qtyNeeded, item.pickingPerDay) - item.avaliablePickers > 0 ? 'text-indigo-600' : 'text-gray-300'}`}>
                        {Math.max(0, calculateManpower(data[item.category].qtyNeeded, item.pickingPerDay) - item.avaliablePickers)}
                      </span>
                    </td>

                    <td className="px-6 py-4 bg-yellow-50/10">
                      <div className="flex justify-center">
                        <input
                          type="text"
                          placeholder="0"
                          className="w-24 px-3 py-1.5 bg-white border border-yellow-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all font-bold text-gray-700 shadow-sm"
                          value={data[item.category].manpower}
                          onChange={(e) => handleInputChange(item.category, 'manpower', e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 bg-green-50/10 text-center">
                      <span className={`text-sm font-bold ${data[item.category].manpower ? 'text-green-600' : 'text-gray-300'}`}>
                        {calculateQtyPicked(data[item.category].manpower, item.pickingPerDay).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 z-10 bg-white border-t-2 border-gray-100">
                <tr className="bg-gray-50 font-bold">
                  <td className="px-6 py-4 text-sm text-gray-900 uppercase tracking-wider">Total</td>
                  <td className="px-6 py-4 text-sm text-indigo-700 bg-indigo-50/30">
                    {totals.availablePickers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-center"></td>
                  <td className="px-6 py-4 text-center text-sm text-green-700 bg-green-50/30">
                    {totals.manpower.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-indigo-700 bg-indigo-50/30">
                    {totals.manpowerNeeded.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center"></td>
                  <td className="px-6 py-4 text-center text-sm text-green-700 bg-green-50/30">
                    {totals.qtyPicked.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {filteredCategories.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-gray-50 rounded-full">
              <Search className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500 font-medium tracking-tight">No results found for your selection.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategories(['All']); }}
              className="text-indigo-600 text-sm font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default ManpowerCalculator;
