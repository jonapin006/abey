/**
 * Dashboard Business Logic Service
 * Pure business logic for dashboard operations
 * No API calls or UI dependencies
 */

/**
 * Check if user is a super admin
 * @param {Object} userProfile - User profile object
 * @returns {boolean} True if super admin
 */
export const isSuperAdmin = (userProfile) => {
    return userProfile?.hierarchy_level === 1;
};

/**
 * Filter companies based on user role and permissions
 * Super admins see all companies, regular users see only their assigned company
 * @param {Array} companies - All companies
 * @param {Object} userProfile - User profile
 * @returns {Array} Filtered companies
 */
export const filterCompaniesByUserRole = (companies, userProfile) => {
    if (!companies || companies.length === 0) return [];
    if (!userProfile) return companies;

    const isAdmin = isSuperAdmin(userProfile);

    if (isAdmin) {
        return companies;
    }

    if (userProfile.company_id) {
        return companies.filter(company => company.id === userProfile.company_id);
    }

    return companies;
};

/**
 * Determine if company selector should be shown
 * @param {Array} filteredCompanies - Filtered companies
 * @param {boolean} profileLoading - Profile loading state
 * @param {boolean} companiesLoading - Companies loading state
 * @returns {boolean} True if selector should be shown
 */
export const shouldShowCompanySelector = (filteredCompanies, profileLoading, companiesLoading) => {
    if (profileLoading || companiesLoading) return false;
    return filteredCompanies && filteredCompanies.length > 1;
};

/**
 * Get display name for user
 * @param {Object} userProfile - User profile
 * @param {Object} user - Auth user
 * @param {boolean} loading - Loading state
 * @returns {string} Display name
 */
export const getDisplayName = (userProfile, user, loading) => {
    if (loading) return '...';
    return userProfile?.full_name || user?.email || 'Usuario';
};

/**
 * Get auto-selected company ID
 * Returns the company ID if user has only one company
 * @param {Array} filteredCompanies - Filtered companies
 * @returns {string|null} Company ID or null
 */
export const getAutoSelectedCompany = (filteredCompanies) => {
    if (!filteredCompanies || filteredCompanies.length !== 1) return null;
    return filteredCompanies[0].id;
};

/**
 * Check if dashboard is in loading state
 * @param {boolean} profileLoading - Profile loading state
 * @param {boolean} companiesLoading - Companies loading state
 * @returns {boolean} True if loading
 */
export const isDashboardLoading = (profileLoading, companiesLoading) => {
    return profileLoading || companiesLoading;
};

/**
 * Get welcome message for user
 * @param {string} displayName - User's display name
 * @returns {string} Welcome message
 */
export const getWelcomeMessage = (displayName) => {
    return `¡Bienvenido ${displayName}!`;
};

/**
 * Get current year
 * @returns {number} Current year
 */
export const getCurrentYear = () => {
    return new Date().getFullYear();
};

/**
 * Validate company selection
 * @param {string} companyId - Selected company ID
 * @param {Array} availableCompanies - Available companies
 * @returns {boolean} True if valid
 */
export const isValidCompanySelection = (companyId, availableCompanies) => {
    if (!companyId) return false;
    if (!availableCompanies || availableCompanies.length === 0) return false;
    return availableCompanies.some(company => company.id === companyId);
};
