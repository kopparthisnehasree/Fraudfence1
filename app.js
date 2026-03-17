document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
                
                // Trigger counter animation if it's the stats section
                if (entry.target.classList.contains('stats-grid') || entry.target.querySelector('.stats-grid')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));

    // Stats Counter Animation
    let countersAnimated = false;
    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;
        
        const counters = document.querySelectorAll('.stat-number');
        const speed = 200;

        counters.forEach(counter => {
            const animate = () => {
                const targetValue = parseFloat(counter.getAttribute('data-target'));
                const currentValue = parseFloat(counter.innerText.replace(/,/g, ''));
                
                // Calculate step based on target size
                let step = targetValue / speed;
                if (targetValue > 1000) step = Math.max(step, Math.ceil(targetValue * 0.02));
                
                if (currentValue < targetValue) {
                    let next = currentValue + step;
                    
                    if (targetValue > 1000) {
                         counter.innerText = Math.ceil(next).toLocaleString();
                    } else if (targetValue % 1 !== 0) {
                        counter.innerText = next.toFixed(1);
                    } else {
                        counter.innerText = Math.ceil(next);
                    }
                    setTimeout(animate, 20);
                } else {
                    counter.innerText = targetValue > 1000 ? targetValue.toLocaleString() : targetValue;
                }
            };
            animate();
        });
    }

    // Scanner UI Logic
    const scanBtn = document.getElementById('scanBtn');
    const threatInput = document.getElementById('threatInput');
    const scanResults = document.getElementById('scanResults');
    const loaderContainer = document.querySelector('.loader-container');
    const resultCard = document.querySelector('.result-card');
    const progressFill = document.querySelector('.progress-fill');
    
    // Tab Switching
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            let placeholder = '';
            switch(e.target.dataset.type) {
                case 'url': placeholder = 'Paste suspicious link (e.g., http://login-secure-update.com)'; break;
                case 'email': placeholder = 'Paste email payload or full raw headers...'; break;
                case 'sms': placeholder = 'Paste SMS message text...'; break;
            }
            threatInput.placeholder = placeholder;
            threatInput.value = '';
            // Just apply hidden, don't remove show unless using that class mechanism
            scanResults.classList.remove('show');
            setTimeout(() => {
                scanResults.classList.add('hidden');
            }, 300);
        });
    });

    scanBtn.addEventListener('click', async () => {
        const type = document.querySelector('.tab-btn.active').dataset.type;
        const content = threatInput.value.trim();

        if (!content) {
            threatInput.style.borderColor = 'var(--red)';
            setTimeout(() => threatInput.style.borderColor = 'var(--border-light)', 1000);
            return;
        }

        // URL Validation
        if (type === 'url') {
            const urlPattern = /^(http:\/\/|https:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
            if (!urlPattern.test(content)) {
                // Change placeholder or show alert
                const originalPlaceholder = threatInput.placeholder;
                threatInput.value = '';
                threatInput.placeholder = 'Enter proper website';
                threatInput.style.borderColor = 'var(--red)';
                
                setTimeout(() => {
                    threatInput.style.borderColor = 'var(--border-light)';
                    threatInput.placeholder = originalPlaceholder;
                }, 2000);
                return;
            }
        }

        // Reset UI
        scanResults.classList.remove('hidden');
        scanResults.classList.add('show');
        loaderContainer.style.display = 'block';
        resultCard.style.display = 'none';
        progressFill.style.width = '0%';
        scanBtn.disabled = true;
        
        // UI Progress simulation to look cool
        let progress = 0;
        const scanText = document.querySelector('.loader-text');
        const phases = [
            "Initializing sandbox environment...",
            "Analyzing linguistics and metadata signatures...",
            "Checking domain reputation and SSL certificates...",
            "Extracting and executing payloads..."
        ];

        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 85) progress = 85; // Hold at 85% until API returns
            progressFill.style.width = `${progress}%`;
            
            let phaseIndex = Math.floor((progress / 100) * phases.length);
            if(phaseIndex >= phases.length) phaseIndex = phases.length - 1;
            scanText.innerText = phases[phaseIndex];
        }, 300);

        try {
            const response = await fetch('http://localhost:8000/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, content })
            });
            const data = await response.json();
            
            clearInterval(interval);
            progressFill.style.width = '100%';
            scanText.innerText = 'Finalizing threat assessment...';
            setTimeout(() => showResults(data), 500);

        } catch (error) {
            console.error('API Error:', error);
            clearInterval(interval);
            scanText.innerText = 'Connection to AI Engine Failed (Is backend running?).';
            scanBtn.disabled = false;
        }
    });

    function showResults(data) {
        loaderContainer.style.display = 'none';
        resultCard.style.display = 'block';
        
        // Remove old classes
        resultCard.classList.remove('safe');
        scanBtn.disabled = false;

        const icon = resultCard.querySelector('.threat-icon');
        const title = resultCard.querySelector('.result-title');
        const metrics = resultCard.querySelectorAll('.metric-value');

        if (data.status === 'safe') {
            resultCard.classList.add('safe');
            icon.className = 'ph ph-shield-check threat-icon';
            title.innerText = 'No Threat Detected';
            metrics[0].innerText = data.confidence;
            metrics[0].className = 'metric-value';
            metrics[1].innerText = 'Benign / Verified';
            metrics[2].innerText = data.details || 'Valid SSL, Clean Reputation';
        } else {
            icon.className = 'ph ph-warning-circle threat-icon';
            title.innerText = 'High Risk Detected';
            metrics[0].innerText = data.confidence;
            metrics[0].className = 'metric-value text-danger';
            metrics[1].innerText = data.threatType || 'Malicious Payload';
            metrics[2].innerText = data.indicators || 'Behavioral Anomaly';
        }
    }
});
