import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Eagerly restore user from localStorage to prevent 'GUEST' flash on reload
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const socketRef = useRef(null);

    // Enhanced showNotification with toast
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, timestamp: Date.now() });

        if (type === 'success') {
            toast.success(message);
        } else if (type === 'error') {
            toast.error(message);
        } else {
            toast(message);
        }

        setTimeout(() => setNotification(null), 5000);
    };

    // Fetch data from APIs
    const fetchData = async () => {
        try {
            setLoading(true);
            const results = await Promise.allSettled([
                apiClient.getStudents(),
                apiClient.getCourses(),
                apiClient.getBatches(),
                apiClient.getExpenses(),
                apiClient.getSettings(),
            ]);

            const [
                studentsRes,
                coursesRes,
                batchesRes,
                expensesRes,
                settingsRes
            ] = results;

            // Only show errors if user is logged in (has token)
            const shouldShowErrors = !!token;

            if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value || []);
            else if (shouldShowErrors) showNotification(studentsRes.reason?.message || 'Failed to load students', 'error');

            if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value || []);
            else if (shouldShowErrors) showNotification(coursesRes.reason?.message || 'Failed to load courses', 'error');

            if (batchesRes.status === 'fulfilled') setBatches(batchesRes.value || []);
            else if (shouldShowErrors) showNotification(batchesRes.reason?.message || 'Failed to load batches', 'error');

            if (expensesRes.status === 'fulfilled') setExpenses(expensesRes.value || []);
            else if (shouldShowErrors) showNotification(expensesRes.reason?.message || 'Failed to load expenses', 'error');

            if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value || {});
            else if (shouldShowErrors) showNotification(settingsRes.reason?.message || 'Failed to load settings', 'error');
        } catch (error) {
            console.error('Core Sync Error:', error.message);
            if (token) {
                showNotification(error.message || 'Failed to sync app data', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Initialize socket connection using useRef to prevent re-initialization
    useEffect(() => {
        if (token) {
            const newSocket = io('http://localhost:5001', {
                transports: ['websocket'],
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: Infinity, // Try to reconnect indefinitely
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                // Add ping/pong to detect broken connections
                pingInterval: 10000,
                pingTimeout: 5000
            });

            newSocket.on('connect', () => {
                console.log('Socket connected successfully');
                setSocketConnected(true);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setSocketConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setSocketConnected(false);
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
                setSocketConnected(false);
            });

            newSocket.on('reconnect', (attemptNumber) => {
                console.log('Socket reconnected after', attemptNumber, 'attempts');
                setSocketConnected(true);
            });

            newSocket.on('reconnecting', (attemptNumber) => {
                console.log('Socket attempting to reconnect, attempt number:', attemptNumber);
            });

            socketRef.current = newSocket;

            // Restore user and fetch data (token is already set)
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Only update if different from current state (avoid re-renders)
                setUser(prev => prev?.id === parsedUser.id ? prev : parsedUser);
                fetchData();

                // Join user's room when authenticated
                newSocket.emit('join-room', `user_${parsedUser.id}`);
                if (parsedUser.batchId) {
                    newSocket.emit('join-batch', parsedUser.batchId);
                }
            } else {
                setLoading(false);
            }

            return () => {
              if (newSocket && !newSocket.disconnected) {
                  console.log('🔌 Cleaning up socket connection...');
                    newSocket.removeAllListeners();
                    newSocket.disconnect();
                }
            };
        } else {
            // If no token, set socket to null
            socketRef.current = null;
            setSocketConnected(false);
            setLoading(false);
        }
    }, [token]); // Only recreate socket when token changes

    // Memoize socket to prevent re-renders
    const socket = socketRef.current;

    // Enhanced login function with feedback
    const login = async (email, password) => {
        try {
            console.log('Starting login process...'); // Debug log
            // Clear any stale session data
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            const response = await apiClient.login(email, password);
            console.log('Login API response:', response); // Debug log

            // The login response already contains the full user object — no need
            // for a redundant /auth/me call that can silently fail post-auth.
            if (response.token && response.user) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                setToken(response.token);
                setUser(response.user);

                toast.success(`Welcome back, ${response.user.name}!`);
                return { success: true, user: response.user };
            } else {
                console.log('Response missing token or user:', response); // Debug log
                throw new Error('Login failed: No token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Login failed';

            if (
                errorMessage.includes('User not found') ||
                errorMessage.includes('Invalid email or password') ||
                errorMessage.includes('Invalid credentials')
            ) {
                toast.error('Invalid email or password. Please try again.');
            } else {
                toast.error(`Login failed: ${errorMessage}`);
            }

            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
    };

    const registerUser = async (userData) => {
        try {
            await apiClient.register(userData);
            toast.success('User created successfully!');
            return true;
        } catch (err) {
            toast.error(err.message || 'Failed to create user');
            return false;
        }
    };

    // Student methods
    const addStudent = async (formData) => {
        try {
            await apiClient.createStudent(formData);
            await fetchData();
            toast.success('Student Registered Successfully!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || error.message || 'Failed to add student');
            return false;
        }
    };

    const updateStudent = async (id, updatedData) => {
        try {
            await apiClient.updateStudent(id, updatedData);
            await fetchData();
            toast.success('Student record updated successfully!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || error.message || 'Failed to update student');
            return false;
        }
    };

    const deleteStudent = async (id) => {
        try {
            await apiClient.deleteStudent(id);
            await fetchData();
            toast.success('Student record removed successfully');
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Failed to delete student');
        }
    };

    const updatePayment = async (studentId, installmentNumber) => {
        const student = students.find(s => (s._id === studentId || s.id === studentId));
        if (!student) return;

        const updatedPayments = student.payments.map(p => {
            if (p.installmentNumber === installmentNumber) {
                return { ...p, status: 'Paid', datePaid: new Date().toISOString().split('T')[0] };
            }
            return p;
        });
        const totalPaid = updatedPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);

        await updateStudent(studentId, { payments: updatedPayments, paidAmount: totalPaid });
    };

    // Expense methods
    const addExpense = async (expense) => {
        try {
            await apiClient.createExpense(expense);
            await fetchData();
            toast.success('Expense logged successfully!');
            return true;
        } catch (err) {
            toast.error(err.message || 'Failed to add expense');
            return false;
        }
    };

    const deleteExpense = async (id) => {
        try {
            await apiClient.deleteExpense(id);
            await fetchData();
            toast.success('Expense deleted successfully');
            return true;
        } catch (err) {
            toast.error(err.message || 'Failed to delete expense');
            return false;
        }
    };

    // Batch methods
    const addBatch = async (batch) => {
        try {
            await apiClient.createBatch(batch);
            await fetchData();
            toast.success('Batch created successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to create batch');
        }
    };

    const deleteBatch = async (id) => {
        try {
            await apiClient.deleteBatch(id);
            await fetchData();
            toast.success('Batch deleted successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to delete batch');
        }
    };

    // Course methods
    const addCourse = async (course) => {
        try {
            await apiClient.createCourse(course);
            await fetchData();
            toast.success('Course published successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to create course');
        }
    };

    const updateCourse = async (id, courseData) => {
        try {
            await apiClient.updateCourse(id, courseData);
            await fetchData();
            toast.success('Course updated successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to update course');
        }
    };

    const deleteCourse = async (id) => {
        try {
            await apiClient.deleteCourse(id);
            await fetchData();
            toast.success('Course deleted successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to delete course');
        }
    };

    // Settings methods
    const updateSettings = async (formData) => {
        try {
            await apiClient.updateSettings(formData);
            await fetchData();
            toast.success('Logo uploaded successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to update settings');
        }
    };

    // Stats calculation
    const getStats = () => {
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);
        const totalStudents = students.length;
        const totalRevenue = students.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
        const pendingFees = students.reduce((acc, s) => {
            return acc + (s.payments?.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0) || 0);
        }, 0);
        const monthlyExpenses = expenses
            .filter(e => e.date && e.date.startsWith(currentMonth))
            .reduce((acc, e) => acc + e.amount, 0);

        return { totalStudents, totalRevenue, pendingFees, monthlyExpenses };
    };

    // Function to refresh financial stats specifically
    const refreshFinancialStats = async () => {
        try {
            // Refresh all data which includes financial stats
            await fetchData();
        } catch (error) {
            console.error('Error refreshing financial stats:', error);
        }
    };

    const value = {
        user,
        token,
        login,
        logout,
        registerUser,
        courses,
        batches,
        students,
        expenses,
        settings,
        loading,
        addStudent,
        updateStudent,
        deleteStudent,
        updatePayment,
        addExpense,
        deleteExpense,
        addBatch,
        deleteBatch,
        addCourse,
        updateCourse,
        deleteCourse,
        updateSettings,
        getStats,
        notification,
        showNotification,
        refreshData: fetchData,
        socket: socketRef.current, // Use the socket from ref
        socketConnected,
        api: apiClient,
        refreshFinancialStats
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Add the useApp hook
export const useApp = () => useContext(AppContext);
