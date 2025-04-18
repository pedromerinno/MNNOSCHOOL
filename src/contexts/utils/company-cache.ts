
export const clearCompanyCache = () => {
  localStorage.removeItem('userCompanies');
  localStorage.removeItem('userCompaniesTimestamp');
  localStorage.removeItem('selectedCompanyId');
  localStorage.removeItem('selectedCompany');
  console.log('All company cache cleared during auth state change');
};
