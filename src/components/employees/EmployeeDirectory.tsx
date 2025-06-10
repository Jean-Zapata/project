import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Users,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import Modal from "../common/Modal";

// Define the Employee interface to match your Java model
interface Employee {
  id?: number;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  fechaIngreso: string;
  salario?: number;
  estado: string;
}

const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Employee>({
    nombres: "",
    apellidos: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: "",
    fechaIngreso: "",
    salario: 0,
    estado: "ACTIVO",
  });

  const API_BASE_URL = "http://localhost:9898/api/empleados";

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error("Error al cargar empleados");
      }
      const data = await response.json();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Delete employee
  const deleteEmployee = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar este empleado?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEmployees(employees.filter((emp) => emp.id !== id));
      } else {
        throw new Error("Error al eliminar empleado");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  // Edit employee functions
  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      ...employee,
      fechaNacimiento: employee.fechaNacimiento || "",
      telefono: employee.telefono || "",
      direccion: employee.direccion || "",
      salario: employee.salario || 0,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingEmployee(null);
    setFormData({
      nombres: "",
      apellidos: "",
      dni: "",
      email: "",
      telefono: "",
      direccion: "",
      fechaNacimiento: "",
      fechaIngreso: "",
      salario: 0,
      estado: "ACTIVO",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salario" ? parseFloat(value) || 0 : value,
    }));
  };

  const updateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee?.id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${editingEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployees(
          employees.map((emp) =>
            emp.id === editingEmployee.id ? updatedEmployee : emp
          )
        );
        closeEditModal();
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al actualizar empleado");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const statuses = ["ACTIVO", "INACTIVO"];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.dni.includes(searchTerm);

    const matchesStatus =
      filterStatus === "all" || employee.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const csvContent = [
      [
        "ID",
        "Nombres",
        "Apellidos",
        "DNI",
        "Email",
        "Teléfono",
        "Salario",
        "Estado",
        "Fecha Ingreso",
      ],
      ...filteredEmployees.map((emp) => [
        emp.id || "",
        emp.nombres,
        emp.apellidos,
        emp.dni,
        emp.email,
        emp.telefono || "",
        emp.salario || "",
        emp.estado,
        emp.fechaIngreso,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "empleados.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    return status === "ACTIVO"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "No especificado";
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchEmployees}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
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
          <h2 className="text-2xl font-bold text-gray-900">
            Directorio de Empleados
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestionar información de empleados ({employees.length} empleados)
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
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm font-medium border-l border-gray-300 ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los Estados</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            onClick={fetchEmployees}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="w-4 h-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Employee Cards/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {employee.nombres[0]}
                    {employee.apellidos[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {employee.nombres} {employee.apellidos}
                  </h3>
                  <p className="text-sm text-gray-600">DNI: {employee.dni}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
                {employee.telefono && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    {employee.telefono}
                  </div>
                )}
                {employee.direccion && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{employee.direccion}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    employee.estado
                  )}`}
                >
                  {employee.estado}
                </span>
                {employee.salario && (
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(employee.salario)}
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Ingreso: {formatDate(employee.fechaIngreso)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(employee)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => employee.id && deleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {employee.nombres[0]}
                            {employee.apellidos[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.nombres} {employee.apellidos}
                          </div>
                          <div className="text-sm text-gray-500">
                            DNI: {employee.dni}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {employee.email}
                      </div>
                      {employee.telefono && (
                        <div className="text-sm text-gray-500">
                          {employee.telefono}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.salario
                        ? formatCurrency(employee.salario)
                        : "No especificado"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          employee.estado
                        )}`}
                      >
                        {employee.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(employee.fechaIngreso)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
    onClick={() => openEditModal(employee)}
    className="text-blue-600 hover:text-blue-900"
  >
    Editar
  </button>
                      <button
                        onClick={() =>
                          employee.id && deleteEmployee(employee.id)
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredEmployees.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron empleados
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los criterios de búsqueda o filtros.
          </p>
        </div>
      )}

      {/* Modal de edición */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title={editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
      >
        <form onSubmit={updateEmployee} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="nombres"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombres *
              </label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="apellidos"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Apellidos *
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="dni"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                DNI *
              </label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="salario"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Salario
              </label>
              <input
                type="number"
                id="salario"
                name="salario"
                value={formData.salario}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="fechaIngreso"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fecha de Ingreso *
              </label>
              <input
                type="date"
                id="fechaIngreso"
                name="fechaIngreso"
                value={formData.fechaIngreso}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="estado"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="direccion"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Dirección
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeDirectory;
