import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, Clock, MapPin, Monitor, Smartphone, Globe, RefreshCw, AlertCircle } from 'lucide-react';

// API Service
const API_BASE_URL = 'http://localhost:9898/api';

interface SesionResponse {
  id?: number;
  token: string;
  fechaInicio: string;
  fechaExpiracion: string;
  activa: boolean;
  ipAddress?: string;
  userAgent?: string;
  fechaFin?: string;
  usuario?: {
    id: number;
    username: string;
    email: string;
  };
}

class SesionService {
  private baseURL = `${API_BASE_URL}/sesiones`;

  async getAllSessions(): Promise<SesionResponse[]> {
    try {
      const response = await fetch(this.baseURL);
      if (!response.ok) {
        throw new Error('Error al obtener las sesiones');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      throw error;
    }
  }

  async closeSession(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activa: false,
          fechaFin: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Error al cerrar la sesión');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }
}

const sesionService = new SesionService();

// Transform API data to component format
const transformSessionData = (apiSession: SesionResponse) => {
  const now = new Date();
  const fechaInicio = new Date(apiSession.fechaInicio);
  const fechaExpiracion = new Date(apiSession.fechaExpiracion);
  const fechaFin = apiSession.fechaFin ? new Date(apiSession.fechaFin) : null;
  
  // Calculate duration
  let duration = 0;
  if (fechaFin) {
    duration = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60));
  } else if (apiSession.activa) {
    duration = Math.floor((now.getTime() - fechaInicio.getTime()) / (1000 * 60));
  }
  
  // Determine status
  let status = 'expired';
  if (apiSession.activa && now < fechaExpiracion) {
    status = 'active';
  } else if (!apiSession.activa && fechaFin) {
    status = 'terminated';
  }

  // Add test user info if missing
  let userName = apiSession.usuario?.username || 'Usuario Desconocido';
  let userEmail = apiSession.usuario?.email || 'email@desconocido.com';
  
  // Override with test users if they match
  if (userEmail === 'admin@company.com') {
    userName = 'Admin (Prueba)';
  } else if (userEmail === 'employee@company.com') {
    userName = 'Employee (Prueba)';
  }

  return {
    id: apiSession.id?.toString() || Math.random().toString(),
    userId: apiSession.usuario?.id?.toString() || '0',
    userEmail,
    userName,
    loginTime: apiSession.fechaInicio,
    logoutTime: apiSession.fechaFin || undefined,
    ipAddress: apiSession.ipAddress || 'IP Desconocida',
    userAgent: apiSession.userAgent || 'User Agent Desconocido',
    location: 'Ubicación Desconocida', // API doesn't provide location
    duration,
    status
  };
};

const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'terminated'>('all');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load sessions from API
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiSessions = await sesionService.getAllSessions();
      const transformedSessions = apiSessions.map(transformSessionData);
      setSessions(transformedSessions);
    } catch (err) {
      setError('Error al cargar las sesiones. Verifique que la API esté funcionando.');
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ipAddress.includes(searchTerm) ||
      session.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    
    const matchesDate = !filterDate || 
      new Date(session.loginTime).toDateString() === new Date(filterDate).toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'expired': return 'Expirada';
      case 'terminated': return 'Terminada';
      default: return status;
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Desconocido';
  };

  const getOSName = (userAgent: string) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS X')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('iPhone')) return 'iOS';
    if (userAgent.includes('Android')) return 'Android';
    return 'Desconocido';
  };

  const handleExport = () => {
    console.log('Exportando datos de sesiones...');
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await sesionService.closeSession(parseInt(sessionId));
      await loadSessions(); // Reload sessions after terminating
    } catch (error) {
      console.error('Error terminando sesión:', error);
    }
  };

  const handleRefresh = () => {
    loadSessions();
  };

  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const totalSessions = sessions.length;
  const avgDuration = sessions
    .filter(s => s.duration && s.duration > 0)
    .reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.filter(s => s.duration && s.duration > 0).length || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-lg text-gray-600">Cargando sesiones...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error al cargar sesiones</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sesiones</h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitorea las sesiones activas y el historial de accesos de usuarios
          </p>
          <p className="mt-1 text-xs text-blue-600">
            Usuarios de prueba: admin@company.com / employee@company.com (password: password)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sesiones Activas</p>
              <p className="text-2xl font-bold text-gray-900">{activeSessions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sesiones</p>
              <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Duración Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(Math.round(avgDuration))}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MapPin className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ubicaciones Únicas</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(sessions.map(s => s.location).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por usuario, email, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activas</option>
            <option value="expired">Expiradas</option>
            <option value="terminated">Terminadas</option>
          </select>
          
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avanzados
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inicio de Sesión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {session.userName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{session.userName}</div>
                        <div className="text-sm text-gray-500">{session.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDateTime(session.loginTime)}</div>
                    {session.logoutTime && (
                      <div className="text-sm text-gray-500">Fin: {formatDateTime(session.logoutTime)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.status === 'active' ? (
                      <span className="text-green-600 font-medium">En curso</span>
                    ) : (
                      formatDuration(session.duration)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(session.userAgent)}
                      <div>
                        <div className="text-sm text-gray-900">{getBrowserName(session.userAgent)}</div>
                        <div className="text-sm text-gray-500">{getOSName(session.userAgent)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{session.location || 'Desconocida'}</div>
                    <div className="text-sm text-gray-500">{session.ipAddress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                      {getStatusText(session.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {session.status === 'active' && (
                      <button
                        onClick={() => handleTerminateSession(session.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Terminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredSessions.length)}</span> de{' '}
                  <span className="font-medium">{filteredSessions.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredSessions.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron sesiones</h3>
          <p className="text-gray-500">Intenta ajustar tus criterios de búsqueda o filtros.</p>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;