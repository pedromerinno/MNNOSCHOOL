
export function useCoursesPageUtils(selectedCompany: any) {
  const getTitle = () => {
    return selectedCompany 
      ? `Todos os Cursos - ${selectedCompany.nome}` 
      : "Todos os Cursos";
  };

  return { getTitle };
}
