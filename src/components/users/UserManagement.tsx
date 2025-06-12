import React, { useState, useEffect } from "react";
import { Usuario } from "../../types";
import { Search, Plus, Filter, Edit, Trash2, Loader2 } from "lucide-react";
import Modal from "../common/Modal";
import UserForm from "./UserForm";
import usuarioService from "../services/usuarioService";
import { useToast } from "../../context/ToastContext";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { addToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await usuarioService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      addToast({
        type: "error",
        message: "Error al cargar los usuarios. Por favor, intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.employee?.firstName &&
        user.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.employee?.lastName && user.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      filterRole === "all" || user.role.id.toString() === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: Usuario) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (user: Usuario) => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar al usuario "${user.username}"?`
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(user.id!);
      await usuarioService.deleteUser(user.id!);
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));

      addToast({
        type: "success",
        message: `Usuario "${user.username}" eliminado exitosamente.`,
      });
    } catch (error) {
      addToast({
        type: "error",
        message: `Error al eliminar el usuario "${user.username}". Por favor, intenta de nuevo.`,
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleUserSubmit = async (userData: any) => {
    try {
      if (selectedUser) {
        // Actualización
        const updateData = {
          username: userData.username,
          email: userData.email,
          isActive: userData.isActive ?? true,
          roleId: Number(userData.roleId),
          password: userData.password,
          employee:
            userData.employee &&
            (userData.employee.nombres || userData.employee.firstName)
              ? {
                  firstName:
                    userData.employee.nombres || userData.employee.firstName,
                  lastName:
                    userData.employee.apellidos || userData.employee.lastName,
                  dni: userData.employee.dni,
                  email: userData.employee.email,
                  phone: userData.employee.telefono || userData.employee.phone,
                  address:
                    userData.employee.direccion || userData.employee.address,
                  birthDate:
                    userData.employee.fechaNacimiento ||
                    userData.employee.birthDate,
                  hireDate:
                    userData.employee.fechaIngreso ||
                    userData.employee.hireDate,
                  salary: userData.employee.salario || userData.employee.salary,
                  status: userData.employee.estado || userData.employee.status,
                }
              : undefined,
        };

        const updatedUser = await usuarioService.updateUser(
          selectedUser.id!,
          updateData
        );

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id ? updatedUser : user
          )
        );

        addToast({
          type: "success",
          message: "Usuario actualizado exitosamente!",
        });
      } else {
        // Creación
        const createData = {
          username: userData.username,
          password: userData.password,
          email: userData.email,
          roleId: Number(userData.roleId),
          employee:
            userData.employee &&
            (userData.employee.nombres || userData.employee.firstName)
              ? {
                  nombres:
                    userData.employee.nombres || userData.employee.firstName,
                  apellidos:
                    userData.employee.apellidos || userData.employee.lastName,
                  dni: userData.employee.dni,
                  email: userData.employee.email,
                  telefono:
                    userData.employee.telefono || userData.employee.phone,
                  direccion:
                    userData.employee.direccion || userData.employee.address,
                  fechaNacimiento:
                    userData.employee.fechaNacimiento ||
                    userData.employee.birthDate,
                  fechaIngreso:
                    userData.employee.fechaIngreso ||
                    userData.employee.hireDate ||
                    new Date().toISOString(),
                  salario:
                    userData.employee.salario || userData.employee.salary,
                }
              : undefined,
        };

        const newUser = await usuarioService.createUser(createData);
        setUsers((prevUsers) => [...prevUsers, newUser]);
        addToast({
          type: "success",
          message: "Usuario creado exitosamente!",
        });
      }
      setShowUserModal(false);
    } catch (error: any) {
      addToast({
        type: "error",
        message: `Error al ${
          selectedUser ? "actualizar" : "crear"
        } el usuario: ${error.message}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando usuarios...</span>
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
            Gestión de Usuarios
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Administra los usuarios del sistema
          </p>
        </div>
        <button
          onClick={handleCreateUser}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los Roles</option>
            <option value="1">Administrador</option>
            <option value="2">Usuario</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter className="w-4 h-4 mr-2" />
            Más Filtros
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Usuario
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rol
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  DNI
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Último Acceso
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.employee
                              ? `${user.employee.firstName?.[0] || ""}${
                                  user.employee.lastName?.[0] || ""
                                }`
                              : user.username.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.employee
                            ? `${user.employee.firstName || ""} ${user.employee.lastName || ""}`.trim() || user.username
                            : user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.employee?.dni || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "Nunca"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      disabled={deleteLoading === user.id}
                      className="text-red-600 hover:text-red-900"
                    >
                      {deleteLoading === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
                </span>{" "}
                de <span className="font-medium">{filteredUsers.length}</span>{" "}
                resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={selectedUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleUserSubmit}
          onCancel={() => setShowUserModal(false)}
        />
      </Modal>
    </div>
  );
};

export default UserManagement;
