import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const UserHome = () => {
  const navigate = useNavigate();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <p className="text-gray-600 mb-2">Olá, Felipe</p>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Juntos, estamos desenhando<br />
            o futuro de grandes empresas
          </h1>
          <div className="flex justify-center mt-6">
            <Button className="bg-black hover:bg-black/90 text-white rounded-full px-6">
              Clique para saber mais sobre a MNNO
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 bg-gray-100 p-2 rounded-lg">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                  </svg>
                </span>
                <span className="font-medium">Integração</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 bg-gray-100 p-2 rounded-lg">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor" />
                  </svg>
                </span>
                <span className="font-medium">Acessos</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 bg-gray-100 p-2 rounded-lg">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 16H7V5h10v14z" fill="currentColor" />
                  </svg>
                </span>
                <span className="font-medium">Documentos</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 bg-gray-100 p-2 rounded-lg">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
                  </svg>
                </span>
                <span className="font-medium">Escola</span>
              </div>
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
              </svg>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 bg-gray-100 p-2 rounded-lg">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor" />
                  </svg>
                </span>
                <span className="font-medium">Comunidade</span>
              </div>
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
              </svg>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Calendar Widget */}
          <Card className="border-0 shadow-md overflow-hidden bg-amber-700 text-white">
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-medium">Julho 2022</h3>
                <div className="flex space-x-2">
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-7 w-7">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-7 w-7">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <div className="grid grid-cols-7 text-center text-xs mb-2">
                  <div>Seg</div>
                  <div>Ter</div>
                  <div>Qua</div>
                  <div>Qui</div>
                  <div>Sex</div>
                  <div>Sab</div>
                  <div>Dom</div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center">
                  <div className="text-white/50 h-8 w-8 flex items-center justify-center text-sm">27</div>
                  <div className="text-white/50 h-8 w-8 flex items-center justify-center text-sm">28</div>
                  <div className="text-white/50 h-8 w-8 flex items-center justify-center text-sm">29</div>
                  <div className="text-white/50 h-8 w-8 flex items-center justify-center text-sm">30</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">1</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">2</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">3</div>
                  
                  <div className="h-8 w-8 flex items-center justify-center text-sm">4</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">5</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">6</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">7</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">8</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">9</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">10</div>
                  
                  <div className="h-8 w-8 flex items-center justify-center text-sm">11</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">12</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">13</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">14</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">15</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">16</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">17</div>
                  
                  <div className="h-8 w-8 flex items-center justify-center text-sm">18</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm bg-white/30 rounded-full">19</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">20</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">21</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">22</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">23</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">24</div>
                  
                  <div className="h-8 w-8 flex items-center justify-center text-sm">25</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">26</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">27</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">28</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">29</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">30</div>
                  <div className="h-8 w-8 flex items-center justify-center text-sm">31</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notifications Widget */}
          <Card className="border-0 shadow-md overflow-hidden bg-orange-50">
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-medium">Avisos</h3>
                <div className="flex space-x-2">
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium mb-2">
                    Recesso
                  </span>
                  <h4 className="font-medium mb-1">No dia 25 teremos recesso devido ao feriado de...</h4>
                  <div className="flex items-center text-gray-500 text-sm">
                    <img 
                      src="https://i.pravatar.cc/150?img=44" 
                      alt="User avatar" 
                      className="h-6 w-6 rounded-full mr-2"
                    />
                    <span>Jéssica</span>
                    <span className="mx-2">•</span>
                    <span>5 min atrás</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-100 p-4 text-center">
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  ver todos
                </button>
              </div>
            </CardContent>
          </Card>
          
          {/* Feedback Widget */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-medium">Feedbacks</h3>
                <span className="text-2xl font-medium">4</span>
              </div>
              
              <div className="px-4 pb-4">
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="mb-2">
                    <span className="font-medium">Parabéns Felipe,</span><br />
                    pelo projeto da Syngenta.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <img 
                        src="https://i.pravatar.cc/150?img=44" 
                        alt="User avatar" 
                        className="h-6 w-6 rounded-full mr-2"
                      />
                      <span>Jéssica</span>
                      <span className="mx-2">•</span>
                      <span>5 min atrás</span>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      retribuir
                    </button>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="mb-2">
                    <span className="font-medium">Parabéns Felipe,</span><br />
                    pelo projeto da Syngenta.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <img 
                        src="https://i.pravatar.cc/150?img=44" 
                        alt="User avatar" 
                        className="h-6 w-6 rounded-full mr-2"
                      />
                      <span>Jéssica</span>
                      <span className="mx-2">•</span>
                      <span>5 min atrás</span>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      retribuir
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <div className="container mx-auto px-4">
          <p className="text-gray-400">MNNO</p>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6">
        <Button className="bg-black hover:bg-black/90 text-white rounded-full px-4 py-2 shadow-lg">
          Pedir ajuda
        </Button>
      </div>
    </div>
  );
};
