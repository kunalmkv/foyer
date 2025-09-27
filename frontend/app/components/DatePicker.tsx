'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    minDateTime?: string;
    error?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    minDateTime,
    error = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        value ? new Date(value) : null
    );
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState({
        hours: value ? new Date(value).getHours() : 12,
        minutes: value ? new Date(value).getMinutes() : 0,
        ampm: value ? (new Date(value).getHours() >= 12 ? 'PM' : 'AM') : 'AM'
    });

    const dropdownRef = useRef<HTMLDivElement>(null);

    const formatDisplayDate = (date: Date | null): string => {
        if (!date) return '';
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleDateString('en-US', options);
    };

    const formatISODateTime = (date: Date, time: { hours: number; minutes: number; ampm: string }): string => {
        const adjustedHours = time.ampm === 'PM' && time.hours !== 12
            ? time.hours + 12
            : time.ampm === 'AM' && time.hours === 12
            ? 0
            : time.hours;

        const newDate = new Date(date);
        newDate.setHours(adjustedHours, time.minutes, 0, 0);

        return newDate.toISOString().slice(0, 16);
    };

    const getDaysInMonth = (date: Date): Date[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDate = new Date(firstDay);
        startDate.setDate(firstDay.getDate() - firstDay.getDay());

        const days: Date[] = [];
        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSameMonth = (date: Date, month: Date): boolean => {
        return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
    };

    const isSameDate = (date1: Date, date2: Date | null): boolean => {
        if (!date2) return false;
        return date1.toDateString() === date2.toDateString();
    };

    const isDateDisabled = (date: Date): boolean => {
        if (!minDateTime) return false;
        const minDate = new Date(minDateTime);
        return date < minDate;
    };

    const handleDateSelect = (date: Date) => {
        if (isDateDisabled(date)) return;
        setSelectedDate(date);
        const isoString = formatISODateTime(date, selectedTime);
        onChange(isoString);
    };

    const handleTimeChange = (field: 'hours' | 'minutes' | 'ampm', value: string | number) => {
        const newTime = { ...selectedTime, [field]: value };
        setSelectedTime(newTime);

        if (selectedDate) {
            const isoString = formatISODateTime(selectedDate, newTime);
            onChange(isoString);
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentMonth(newMonth);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const days = getDaysInMonth(currentMonth);
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-gray-700/50 border backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white cursor-pointer flex items-center justify-between ${
                    error ? 'border-red-500' : 'border-gray-600'
                } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
            >
                <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className={selectedDate ? 'text-white' : 'text-gray-400'}>
                        {selectedDate ? formatDisplayDate(selectedDate) : 'Select date and time'}
                    </span>
                </div>
                <Clock className="w-4 h-4 text-gray-400" />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-2xl shadow-2xl p-6 z-50">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigateMonth('prev')}
                            className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <h3 className="text-lg font-semibold text-white">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button
                            onClick={() => navigateMonth('next')}
                            className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1 mb-6">
                        {days.map((day, index) => {
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isSelected = isSameDate(day, selectedDate);
                            const isTodayDate = isToday(day);
                            const isDisabled = isDateDisabled(day);

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDateSelect(day)}
                                    disabled={isDisabled}
                                    className={`h-10 w-10 text-sm rounded-xl transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                            : isTodayDate
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : isCurrentMonth
                                            ? isDisabled
                                                ? 'text-gray-600 cursor-not-allowed'
                                                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                            : 'text-gray-600'
                                    }`}
                                >
                                    {day.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {/* Time Picker */}
                    <div className="border-t border-gray-700/50 pt-6">
                        <div className="flex items-center justify-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <select
                                    value={selectedTime.hours}
                                    onChange={(e) => handleTimeChange('hours', parseInt(e.target.value))}
                                    className="bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2 text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {[...Array(12)].map((_, i) => {
                                        const hour = i + 1;
                                        return (
                                            <option key={hour} value={hour}>
                                                {hour.toString().padStart(2, '0')}
                                            </option>
                                        );
                                    })}
                                </select>
                                <span className="text-gray-400 text-lg">:</span>
                                <select
                                    value={selectedTime.minutes}
                                    onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value))}
                                    className="bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2 text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {[...Array(60)].map((_, i) => {
                                        const minute = i;
                                        return (
                                            <option key={minute} value={minute}>
                                                {minute.toString().padStart(2, '0')}
                                            </option>
                                        );
                                    })}
                                </select>
                                <select
                                    value={selectedTime.ampm}
                                    onChange={(e) => handleTimeChange('ampm', e.target.value)}
                                    className="bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700/50">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};