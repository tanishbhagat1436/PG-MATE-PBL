document.addEventListener('DOMContentLoaded', () => {

    // --- SHARED LOGIC & DATA ---
    function getPgs() {
        const pgsFromStorage = localStorage.getItem('pgListings');
        const defaultPgs = [
            { id: 1, name: 'Sunshine Residency', location: 'Mumbai - Western Suburbs', pgType: 'Girls', roomType: 'Double', rent: 15000, image: 'images/pg-image-1.jpg', address: '123, Sunshine Apts, Andheri West' },
            { id: 2, name: 'Royal Living PG', location: 'Pune - City Center', pgType: 'Boys', roomType: 'Single', rent: 25000, image: 'images/pg-image-2.jpg', address: '456, Royal Palace, FC Road' }
        ];
        return pgsFromStorage ? JSON.parse(pgsFromStorage) : defaultPgs;
    }
    function savePgs(pgs) {
        localStorage.setItem('pgListings', JSON.stringify(pgs));
    }

    // --- LOGIN/SIGNUP PAGE SCRIPT ---
    if (document.querySelector('.auth-container')) {
        window.switchLogin = function(role) {
            if (role === 'owner') {
                document.getElementById('tenant-login').style.display = 'none';
                document.getElementById('owner-login').style.display = 'flex';
            } else {
                document.getElementById('tenant-login').style.display = 'flex';
                document.getElementById('owner-login').style.display = 'none';
            }
        };
        window.switchSignup = function(role) {
            if (role === 'owner') {
                document.getElementById('tenant-signup').style.display = 'none';
                document.getElementById('owner-signup').style.display = 'flex';
            } else {
                document.getElementById('tenant-signup').style.display = 'flex';
                document.getElementById('owner-signup').style.display = 'none';
            }
        };
    }

    // --- TENANT DASHBOARD SCRIPT ---
    if (document.querySelector('.dashboard-main-content')) {
        const pgGrid = document.getElementById('pg-listings-grid');
        const resultsCount = document.getElementById('results-count');
        const noResultsMessage = document.getElementById('no-results-message');
        const filterForm = document.getElementById('pg-filter-form');

        function displayPGs(pgs) {
            pgGrid.innerHTML = '';
            resultsCount.textContent = `Displaying ${pgs.length} PGs...`;
            noResultsMessage.style.display = pgs.length === 0 ? 'block' : 'none';
            pgs.forEach(pg => {
                const card = document.createElement('div');
                card.className = 'pg-card';
                card.innerHTML = `
                    <div class="pg-card-image" style="background-image: url('${pg.image}')"></div>
                    <div class="pg-card-content">
                        <h3 class="pg-card-title">${pg.name}</h3>
                        <p class="pg-card-location"><i class="fas fa-map-marker-alt"></i> ${pg.location}</p>
                        <p class="pg-card-price">₹${pg.rent.toLocaleString('en-IN')}<small>/month</small></p>
                    </div>`;
                pgGrid.appendChild(card);
            });
        }
        function applyFilters() {
            const allPgs = getPgs();
            const searchTerm = document.getElementById('search-name-location').value.toLowerCase();
            const maxRent = parseInt(document.getElementById('max-rent').value, 10);
            const location = document.getElementById('location').value;
            const pgType = document.getElementById('pg-type').value;
            const roomType = document.getElementById('room-type').value;
            
            const filteredPgs = allPgs.filter(pg => 
                (searchTerm === '' || pg.name.toLowerCase().includes(searchTerm) || pg.location.toLowerCase().includes(searchTerm)) &&
                (isNaN(maxRent) || !maxRent || pg.rent <= maxRent) &&
                (location === 'all' || pg.location === location) &&
                (pgType === 'all' || pg.pgType === pgType) &&
                (roomType === 'all' || pg.roomType === roomType)
            );
            displayPGs(filteredPgs);
        }
        filterForm.addEventListener('input', applyFilters);
        displayPGs(getPgs());
    }

    // --- OWNER DASHBOARD SCRIPT ---
    if (document.querySelector('.owner-portal-layout')) {
        const mainTitle = document.getElementById('main-title');
        const views = document.querySelectorAll('.view');
        
        function showView(viewId) {
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(viewId).classList.add('active');
            const activeLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            if (activeLink) {
                activeLink.classList.add('active');
                mainTitle.textContent = activeLink.textContent.trim();
            }
        }

        document.querySelector('.sidebar-nav').addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link');
            if (link && link.dataset.view) { e.preventDefault(); showView(link.dataset.view); }
        });
        document.querySelector('.quick-actions').addEventListener('click', (e) => { if (e.target.dataset.view) { showView(e.target.dataset.view); } });

        const addPgForm = document.getElementById('add-pg-form');
        const myPgListingsDiv = document.getElementById('my-pg-listings');
        const editPgIdInput = document.getElementById('edit-pg-id');
        const formTitle = document.getElementById('form-title');
        const formSubmitBtn = document.getElementById('form-submit-btn');
        const formCancelBtn = document.getElementById('form-cancel-btn');
        const statTotalPgs = document.getElementById('stat-total-pgs');

        function renderOwnerPgs() {
            const pgs = getPgs();
            myPgListingsDiv.innerHTML = '';
            document.getElementById('no-pgs-listed').style.display = pgs.length === 0 ? 'block' : 'none';
            statTotalPgs.textContent = pgs.length;
            
            pgs.forEach(pg => {
                const card = document.createElement('div');
                card.className = 'pg-card';
                card.innerHTML = `
                    <div class="owner-actions">
                        <button class="btn-action btn-edit" data-id="${pg.id}"><i class="fas fa-pen"></i></button>
                        <button class="btn-action btn-delete" data-id="${pg.id}"><i class="fas fa-trash"></i></button>
                    </div>
                    <div class="pg-card-image" style="background-image: url('${pg.image}')"></div>
                    <div class="pg-card-content">
                        <h3 class="pg-card-title">${pg.name}</h3>
                    </div>`;
                myPgListingsDiv.appendChild(card);
            });
        }
        
        function resetForm() {
            addPgForm.reset();
            editPgIdInput.value = '';
            formTitle.textContent = 'Add a New PG';
            formSubmitBtn.textContent = 'Add Listing';
            formCancelBtn.style.display = 'none';
            document.getElementById('pg-image').required = true;
        }
        
        function populateFormForEdit(pgId) {
            const pgToEdit = getPgs().find(pg => pg.id === pgId);
            if (!pgToEdit) return;
            document.getElementById('pg-name').value = pgToEdit.name;
            document.getElementById('pg-location').value = pgToEdit.location;
            document.getElementById('pg-address').value = pgToEdit.address || '';
            document.getElementById('owner-pg-type').value = pgToEdit.pgType;
            document.getElementById('owner-room-type').value = pgToEdit.roomType;
            document.getElementById('pg-rent').value = pgToEdit.rent;
            editPgIdInput.value = pgToEdit.id;
            formTitle.textContent = 'Edit PG Details';
            formSubmitBtn.textContent = 'Update Listing';
            formCancelBtn.style.display = 'inline-block';
            document.getElementById('pg-image').required = false;
            showView('view-add-pg');
        }

        addPgForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = parseInt(editPgIdInput.value, 10);
            const imageFile = document.getElementById('pg-image').files[0];
            const processSubmit = (imageData) => {
                let pgs = getPgs();
                const pgData = {
                    name: document.getElementById('pg-name').value,
                    location: document.getElementById('pg-location').value,
                    address: document.getElementById('pg-address').value,
                    pgType: document.getElementById('owner-pg-type').value,
                    roomType: document.getElementById('owner-room-type').value,
                    rent: parseInt(document.getElementById('pg-rent').value, 10),
                };
                if (editId) {
                    const pgIndex = pgs.findIndex(pg => pg.id === editId);
                    if (pgIndex > -1) {
                        pgs[pgIndex] = { ...pgs[pgIndex], ...pgData };
                        if (imageData) pgs[pgIndex].image = imageData;
                    }
                } else {
                    pgs.push({ id: Date.now(), ...pgData, image: imageData });
                }
                savePgs(pgs);
                renderOwnerPgs();
                resetForm();
                showView('view-listings');
            };
            if (imageFile) {
                const reader = new FileReader();
                reader.onloadend = () => processSubmit(reader.result);
                reader.readAsDataURL(imageFile);
            } else if (editId) {
                processSubmit(getPgs().find(p => p.id === editId).image); // Keep old image
            } else {
                alert("Please select an image.");
            }
        });

        myPgListingsDiv.addEventListener('click', (e) => {
            const editButton = e.target.closest('.btn-edit');
            if (editButton) { populateFormForEdit(parseInt(editButton.dataset.id, 10)); }
            
            const deleteButton = e.target.closest('.btn-delete');
            if (deleteButton) {
                if (confirm('Are you sure?')) {
                    let pgs = getPgs().filter(pg => pg.id !== parseInt(deleteButton.dataset.id, 10));
                    savePgs(pgs);
                    renderOwnerPgs();
                }
            }
        });
        formCancelBtn.addEventListener('click', () => { resetForm(); showView('view-listings'); });
        renderOwnerPgs();
    }
});