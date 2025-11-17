document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // DOM Elements
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.overlay');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // Toggle sidebar
    function toggleSidebarFn() {
        document.body.classList.toggle('sidebar-collapsed');
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }

    // Toggle mobile menu
    function toggleMobileMenu() {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
        document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
    }

    // Close mobile menu
    function closeMobileMenu() {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Set active menu
    function setActiveMenu() {
        const links = document.querySelectorAll('.menu-link');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.split('/').pop())) {
                link.classList.add('active');
                const parentMenu = link.closest('.submenu');
                if (parentMenu) {
                    parentMenu.style.maxHeight = parentMenu.scrollHeight + 'px';
                    const parentItem = parentMenu.previousElementSibling;
                    if (parentItem) {
                        parentItem.classList.add('active');
                        const arrow = parentItem.querySelector('.menu-arrow');
                        if (arrow) arrow.classList.add('rotated');
                    }
                }
            }
        });
    }

    // Logout
    function logout() {
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    }

    // Action handlers
    function handleEdit(e) {
        e.preventDefault();
        const examId = e.currentTarget.dataset.id;
        console.log('Edit exam:', examId);
    }

    function handleDelete(e) {
        e.preventDefault();
        const examId = e.currentTarget.dataset.id;
        if (confirm('Are you sure you want to delete this exam?')) {
            console.log('Delete exam:', examId);
        }
    }

    function handleView(e) {
        e.preventDefault();
        const examId = e.currentTarget.dataset.id;
        console.log('View exam:', examId);
    }

    // Loader
    function showLoader() {
        document.getElementById('loaderContainer').style.display = 'block';
        document.getElementById('certificatesTable').style.display = 'none';
        document.getElementById('welcomeMessage').style.display = 'none';
        document.querySelector('.dashboard-grid').style.display = 'none';
    }

    function hideLoader() {
        document.getElementById('loaderContainer').style.display = 'none';
    }

    // Update table title
    function updateTableTitle(title) {
        const tableHeader = document.querySelector('#certificatesTable .card-header h3');
        if (tableHeader) tableHeader.textContent = title;
    }

    // DataTable instance
    let dataTable;

    function loadDataTable(tableData, type) {
        if ($.fn.DataTable.isDataTable('#certificatesDataTable')) {
            dataTable.destroy();
        }

        let columns = [];
        let tableTitle = '';

        if (type === 'suggestions') {
            tableTitle = 'Suggestions';
            columns = [
                { data: 'provider', title: 'Exam Provider' },
                { data: 'name', title: 'Exam Name' },
                { data: 'actions', title: 'Actions', orderable: false, searchable: false }
            ];
        } else if (type === 'certificates') {
            tableTitle = 'Certificates';
            columns = [
                { data: 'id', title: 'Certificate ID' },
                { data: 'provider', title: 'Provider' },
                { data: 'name', title: 'Certificate Name' },
                { data: 'status', title: 'Status' },
                { data: 'createdDate', title: 'Created Date' },
                { data: 'actions', title: 'Actions', orderable: false, searchable: false }
            ];
        }

        updateTableTitle(tableTitle);

        dataTable = $('#certificatesDataTable').DataTable({
            data: tableData,
            columns: columns,
            responsive: true,
            dom: 'Bfrtip',
            pageLength: 10,
            lengthMenu: [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "All"]],
            language: {
                search: "_INPUT_",
                searchPlaceholder: `Search ${tableTitle.toLowerCase()}...`,
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "Showing 0 to 0 of 0 entries",
                infoFiltered: "(filtered from _MAX_ total entries)"
            }
        });

        hideLoader();
        document.getElementById('certificatesTable').style.display = 'block';

        // Attach action handlers
        $(document).off('click', '.btn-edit').on('click', '.btn-edit', handleEdit);
        $(document).off('click', '.btn-delete').on('click', '.btn-delete', handleDelete);
        $(document).off('click', '.btn-view').on('click', '.btn-view', handleView);
    }

    // Load data
    async function loadSuggestions() {
        showLoader();
        try {
            const res = await fetch(`${baseURL}api/exam/getAllExam`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch suggestions');
            const data = await res.json();
            if (!data.status || !data.data) throw new Error('Invalid data format');

            const tableData = [];
            data.data.forEach(provider => {
                provider.exams?.forEach(exam => {
                    tableData.push({
                        provider: provider.exam_provider || 'N/A',
                        name: exam.exam_name || 'N/A',
                        actions: `
                            <button class="btn btn-edit" data-id="${exam._id}"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn btn-delete" data-id="${exam._id}"><i class="fas fa-trash"></i> Delete</button>
                        `
                    });
                });
            });

            loadDataTable(tableData, 'suggestions');
        } catch (err) {
            console.error(err);
            hideLoader();
            alert('Failed to load suggestions');
        }
    }

    async function loadCertificates() {
        showLoader();
        try {
            const res = await fetch(`${baseURL}api/exam/getAllExam`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch certificates');
            const data = await res.json();
            if (!data.status || !data.data) throw new Error('Invalid data format');

            const tableData = [];
            data.data.forEach(provider => {
                provider.exams?.forEach(exam => {
                    tableData.push({
                        id: exam._id || 'N/A',
                        provider: provider.exam_provider || 'N/A',
                        name: exam.exam_name || 'N/A',
                        status: 'Active',
                        createdDate: new Date().toLocaleDateString(),
                        actions: `
                            <button class="btn btn-edit" data-id="${exam._id}"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn btn-delete" data-id="${exam._id}"><i class="fas fa-trash"></i> Delete</button>
                            <button class="btn btn-view" data-id="${exam._id}"><i class="fas fa-eye"></i> View</button>
                        `
                    });
                });
            });

            loadDataTable(tableData, 'certificates');
        } catch (err) {
            console.error(err);
            hideLoader();
            alert('Failed to load certificates');
        }
    }

    // Initialize UI
    function init() {
        // Sidebar state
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            document.body.classList.add('sidebar-collapsed');
            sidebar.classList.add('collapsed');
        }

        setActiveMenu();

        // Close all submenus by default
        document.querySelectorAll('.submenu').forEach(sub => sub.style.maxHeight = '0');

        // Menu click events
        document.getElementById('suggestionLink')?.addEventListener('click', e => {
            e.preventDefault();
            loadCertificates();
            document.querySelectorAll('.menu-link').forEach(link => link.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });

        toggleSidebar?.addEventListener('click', toggleSidebarFn);
        mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
        overlay?.addEventListener('click', closeMobileMenu);
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
    }

    init();
});
