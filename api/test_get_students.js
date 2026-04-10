const axios = require('axios');
(async () => {
    try {
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@hunarasaan.com', 
            password: 'admin' // Need to check if this works, or use a known user
        });
        const token = loginRes.data.token;
        console.log("Logged in");
        const getRes = await axios.get('http://localhost:5001/api/students', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success GET students", getRes.status);
    } catch(err) {
        if(err.response) {
            console.log("Error status:", err.response.status);
            console.log("Error data:", err.response.data);
        } else {
            console.log("Error:", err.message);
        }
    }
})();
