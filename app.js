/* Karni Air Courier & Logistics - Interactive Operations & Logic */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. STICKY HEADER TRANSITION ON SCROLL
    // ==========================================
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================
    // 2. MOBILE NAVIGATION DRAWER
    // ==========================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navigationMenu = document.getElementById('navigation-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileMenuToggle.addEventListener('click', () => {
        navigationMenu.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        if (navigationMenu.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Close menu when links are clicked on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navigationMenu.classList.remove('active');
            mobileMenuToggle.querySelector('i').className = 'fa-solid fa-bars';
            
            // Manage Active Class manually
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // ==========================================
    // 3. SMART COURIER TRACKING REDIRECT
    // ==========================================
    const trackingForm = document.getElementById('tracking-redirect-form');
    
    trackingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const courier = document.getElementById('courier-select').value;
        const trackingId = document.getElementById('tracking-id').value.trim();
        
        if (!courier) {
            alert('Please select a courier partner from the dropdown list.');
            return;
        }
        
        if (!trackingId) {
            alert('Please enter your tracking / AWB consignment number.');
            return;
        }
        
        let targetUrl = '';
        
        switch (courier) {
            case 'delhivery':
                // Delhivery direct AWB tracking link
                targetUrl = `https://www.delhivery.com/track/package/${trackingId}`;
                break;
            case 'dtdc':
                // DTDC general tracking query portal
                targetUrl = `https://www.dtdc.in/tracking/track-your-shipment.html`;
                break;
            case 'mahabali':
                // Shree Mahabali Express tracking using a tracking aggregator query link
                targetUrl = `https://www.trackingmore.com/shree-mahabali-express-tracking.html?number=${trackingId}`;
                break;
            case 'mark':
                // Mark Express tracking using a tracking aggregator query link
                targetUrl = `https://www.trackingmore.com/mark-express-tracking.html?number=${trackingId}`;
                break;
            default:
                alert('Selected partner tracking is currently unavailable. Please contact support.');
                return;
        }
        
        // Open tracking result in new browser tab to maintain your site session
        window.open(targetUrl, '_blank');
    });

    // ==========================================
    // 4. INTERACTIVE RATE ESTIMATOR CALCULATOR
    // ==========================================
    const weightRange = document.getElementById('weight-range');
    const weightVal = document.getElementById('weight-val');
    const destinationSelect = document.getElementById('destination-select');
    const rateCalcForm = document.getElementById('rate-calc-form');
    const estimatedPrice = document.getElementById('estimated-price');

    function calculateRate() {
        const weight = parseFloat(weightRange.value);
        const destination = destinationSelect.value;
        const shipmentType = document.querySelector('input[name="shipment-type"]:checked').value;
        
        // Update range display text
        weightVal.textContent = `${weight.toFixed(1)} kg`;
        
        let baseRate = 0;
        let perKgRate = 0;
        let baseWeightLimit = 0.5; // Documents standard base is 0.5kg
        
        if (shipmentType === 'document') {
            // Document Rate Metrics
            if (destination === 'local') {
                baseRate = 40;
                perKgRate = 20;
            } else if (destination === 'domestic-metro') {
                baseRate = 75;
                perKgRate = 35;
            } else { // domestic-rest
                baseRate = 95;
                perKgRate = 50;
            }
        } else {
            // Parcel/Box Rate Metrics (parcels start with a higher base price)
            baseWeightLimit = 1.0;
            if (destination === 'local') {
                baseRate = 80;
                perKgRate = 30;
            } else if (destination === 'domestic-metro') {
                baseRate = 160;
                perKgRate = 60;
            } else { // domestic-rest
                baseRate = 220;
                perKgRate = 80;
            }
        }
        
        let totalCost = baseRate;
        
        // Calculate additional weight if over limit
        if (weight > baseWeightLimit) {
            const extraWeight = weight - baseWeightLimit;
            totalCost += Math.ceil(extraWeight * 2) / 2 * perKgRate * 2; // Multiplied by steps
        }
        
        // Final aesthetic price styling
        estimatedPrice.textContent = `₹ ${Math.round(totalCost)}*`;
    }

    // Bind event listeners to form controls
    weightRange.addEventListener('input', calculateRate);
    destinationSelect.addEventListener('change', calculateRate);
    
    const radioButtons = document.querySelectorAll('input[name="shipment-type"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', calculateRate);
    });

    // Run initial calculation
    calculateRate();

    // ==========================================
    // 5. BOOKING & CALLBACK REQUEST FORM HANDLER
    // ==========================================
    const pickupForm = document.getElementById('pickup-callback-form');
    const successAlert = document.getElementById('form-success-alert');

    pickupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Retrieve form inputs (could be sent to a backend API or dashboard if scaling)
        const name = document.getElementById('contact-name').value;
        const phone = document.getElementById('contact-phone').value;
        const pincode = document.getElementById('pickup-pincode').value;
        const message = document.getElementById('contact-message').value;

        // Perform basic validations
        if (phone.length < 10) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }

        // Mocking successful submission (simulating API post transition)
        const submitBtn = document.getElementById('btn-submit-pickup');
        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Request...';
        
        setTimeout(() => {
            // Hide form inputs/button smoothly
            pickupForm.style.display = 'none';
            successAlert.style.display = 'flex';
            successAlert.style.opacity = '0';
            
            // Fade alert in
            setTimeout(() => {
                successAlert.style.transition = 'opacity 0.4s ease';
                successAlert.style.opacity = '1';
            }, 50);
            
            // Reset state after 10 seconds to allow another booking
            setTimeout(() => {
                pickupForm.reset();
                pickupForm.style.display = 'flex';
                successAlert.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }, 10000);
            
        }, 1200);
    });

});
