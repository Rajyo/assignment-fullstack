import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  BadgeAlert,
  CheckCircle2,
  CircleDashed,
  PencilLine,
  PlusCircle,
  SquareCheckBig,
  Trash2,
  X,
} from "lucide-react";
import TaskSchema from "./zod";
import { toast } from "sonner";

interface Task {
  _id?: string;
  title: string;
  newTitle?: string;
  status: "pending" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

const App = () => {
  // States
  const [loading, setLoading] = useState({
    isServerUp: false,
    addTask: false,
    updateStatus: false,
    editTitle: false,
    updateTitle: false,
    deleteTask: false,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({
    title: "",
    status: "pending",
  });
  const [updateTask, setUpdateTask] = useState<Task>({
    _id: "",
    title: "",
    newTitle: "",
    status: "pending",
  });

  // Ref
  const ref = useRef<HTMLDivElement | null>(null);

  // Effects
  useEffect(() => {
    fetchTasks();
  }, []);

  // Check server health every 10 seconds once server is down
  useEffect(() => {
    !loading.isServerUp &&
      setTimeout(() => {
        checkHealth();
      }, 10000);
  }, [loading.isServerUp]);

  // Functions
  const onClickOutside = () => {
    setLoading({
      ...loading,
      editTitle: false,
    });
    setUpdateTask({ _id: "", title: "", newTitle: "", status: "pending" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node | null)) {
        onClickOutside();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [onClickOutside]);

  const checkHealth = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_API_URL}/healthz`
    );
    if (response.status === 200) {
      setLoading({
        ...loading,
        isServerUp: true,
      });
      window.location.reload();
    } else {
      toast.error("Server is yet to start, wait a min");
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get<Task[]>(
        `${import.meta.env.VITE_BACKEND_API_URL}`
      );
      setTasks(response.data);
      setLoading({
        ...loading,
        isServerUp: true,
      })
    } catch (error: any) {
      toast.error(error.response.data.error);
    }
  };

  const addTask = async () => {
    setLoading({
      ...loading,
      addTask: true,
    });
    const result = TaskSchema.safeParse(newTask);
    if (!result.success) {
      setLoading({
        ...loading,
        addTask: false,
      });
      return toast.error(result.error.issues[0].message);
    }

    try {
      await axios.post<Task>(`${import.meta.env.VITE_BACKEND_API_URL}`, {
        title: newTask.title,
      });
      fetchTasks();
      setNewTask({ title: "", status: "pending" });
      toast.success("Task added successfully");
    } catch (error: any) {
      toast.error(error.response.data.error);
    }

    setLoading({
      ...loading,
      addTask: false,
    });
  };

  const updateTaskStatus = async (
    id: string,
    title: string,
    status: "pending" | "completed"
  ) => {
    setLoading({
      ...loading,
      updateStatus: true,
    });
    const result = TaskSchema.safeParse({ title, status });
    if (!result.success) {
      setLoading({
        ...loading,
        updateStatus: false,
      });
      return toast.error(result.error.issues[0].message);
    }

    try {
      const updatedStatus = status === "pending" ? "completed" : "pending";
      await axios.put(`${import.meta.env.VITE_BACKEND_API_URL}/${id}`, {
        title: title,
        status: updatedStatus,
      });
      fetchTasks();
      setNewTask({ title: "", status: "pending" });
      toast.success("Task status updated successfully");
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      setLoading({
        ...loading,
        updateStatus: false,
      });
    }
  };

  const updateTaskTitle = async (
    id: string,
    title: string,
    status: "pending" | "completed"
  ) => {
    const result = TaskSchema.safeParse({ title, status });
    if (!result.success) {
      setLoading({
        ...loading,
        updateTitle: false,
      });
      setUpdateTask({
        ...updateTask,
        newTitle: "",
      });
      return toast.error(result.error.issues[0].message);
    }

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_API_URL}/${id}`, {
        title: title,
        status: status,
      });
      fetchTasks();
      setNewTask({ title: "", status: "pending" });
      toast.success("Task Title updated successfully");
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      setLoading({
        ...loading,
        editTitle: false,
        updateTitle: false,
      });
      setUpdateTask({ _id: "", title: "", newTitle: "", status: "pending" });
    }
  };

  const deleteTask = async (id: string) => {
    setLoading({
      ...loading,
      deleteTask: true,
    });
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_API_URL}/${id}`);
      fetchTasks();
      toast.success("Task deleted successfully");
    } catch (error: any) {
      toast.error(error.response.data.error);
    }

    setLoading({
      ...loading,
      deleteTask: false,
    });
  };

  return (
    <section className="w-screen h-screen overflow-hidden flex flex-col items-center bg-gradient-to-r from-violet-200 to-pink-200 pb-10">
      {/* Header */}
      <div className="py-10 bg-white w-full flex items-center justify-center gap-5 mb-10">
        <SquareCheckBig className="sm:w-8 sm:h-8 w-6 h-6" color="blue" />
        <h1 className="sm:text-4xl text-2xl font-bold text-center">
          Task Management App
        </h1>
      </div>

      {/* Task Form */}
      <div className="space-y-8 bg-white p-6 rounded-lg shadow-md w-full 2xl:max-w-[50rem] xl:max-w-[45rem] lg:max-w-[40rem] md:max-w-[35rem] sm:max-w-[30rem] min-[450px]:max-w-[90%] max-w-[95%]">
        <input
          type="text"
          maxLength={20}
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          placeholder="Task title"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTask}
          disabled={loading.addTask || newTask.title.trim() === ""}
          className={`w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 hover:cursor-pointer ${
            loading.addTask || newTask.title.trim() === ""
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {loading.addTask ? (
            <CircleDashed size={20} className="animate-spin" />
          ) : (
            <PlusCircle size={20} />
          )}
          Add Task
        </button>
      </div>

      {/* Server Health */}
      {!loading.isServerUp ? (
        <div className=" mt-16 bg-opacity-50 flex flex-col gap-5 items-center justify-center">
          <h1 className="sm:text-2xl text-lg font-bold text-gray-500">
            Please wait, Server is starting...
          </h1>
          <div className="animate-spin rounded-full lg:h-20 lg:w-20 sm:h-14 sm:w-14 h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : null}

      {/* Task List */}
      <div className="mt-4 w-full overflow-y-auto 2xl:max-w-[50rem] xl:max-w-[45rem] lg:max-w-[40rem] md:max-w-[35rem] sm:max-w-[30rem] min-[450px]:max-w-[90%] max-w-[95%] space-y-4 pr-1 pb-5">
        {tasks.map((task, index) => (
          <div
            key={task._id}
            className={`bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-gray-300 ${
              task.status === "completed" ? "opacity-75" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold flex gap-2 items-center ${
                    task.status === "completed"
                      ? "line-through text-gray-500"
                      : ""
                  }`}
                >
                  <span>{index + 1}.</span>
                  <span>{task.title} </span>
                  <PencilLine
                    size={16}
                    className="hover:cursor-pointer hover:text-blue-500"
                    onClick={() => {
                      setLoading({
                        ...loading,
                        editTitle: true,
                      });
                      setUpdateTask({
                        _id: task._id,
                        newTitle: "",
                        title: task.title,
                        status: task.status,
                      });
                    }}
                  />
                </h3>
                <p className="sm:text-sm text-xs text-gray-400 mt-2">
                  Last Updated at{" "}
                  {new Date(task.updatedAt!).toLocaleTimeString()}
                </p>
              </div>
              {/* Task Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateTaskStatus(task._id!, task.title, task.status)
                  }
                  className={`py-1 px-2 rounded-full transition-colors ${
                    task.status === "completed"
                      ? "bg-green-500 hover:bg-green-600 text-white font-medium hover:cursor-pointer"
                      : "bg-orange-400 hover:bg-orange-500 text-white font-medium hover:cursor-pointer"
                  }`}
                >
                  {task.status === "completed" ? (
                    <p
                      title="toggle"
                      className="flex items-center gap-1 sm:text-sm text-xs"
                    >
                      <CheckCircle2 size={16} />
                      Completed
                    </p>
                  ) : (
                    <p
                      title="toggle"
                      className="flex items-center gap-1 sm:text-sm text-xs"
                    >
                      <BadgeAlert size={16} />
                      Pending
                    </p>
                  )}
                </button>
                <button
                  onClick={() => deleteTask(task._id!)}
                  className="p-1 text-red-400 hover:text-red-500 rounded-full transition-colors hover:cursor-pointer"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Update Title Modal */}
      <div
        className={`${
          loading.editTitle
            ? "w-screen h-screen fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center bg-[#000000d8] z-50"
            : "hidden"
        } `}
      >
        <div
          ref={ref}
          className={`relative bg-white rounded-lg min-[500px]:w-[30rem] w-[95%]
            h-[13rem] min-[400px]:p-6 px-4 py-6 flex flex-col justify-between z-50`}
        >
          <X
            onClick={() => {
              setLoading({
                ...loading,
                editTitle: false,
              });
              setUpdateTask({
                _id: "",
                title: "",
                newTitle: "",
                status: "pending",
              });
            }}
            className="absolute top-4 right-4 cursor-pointer w-4"
          />

          <div className="flex flex-col gap-1 mt-4">
            <h1 className="text-xl font-bold">Update Title</h1>
            <input
              type="text"
              maxLength={20}
              value={updateTask.newTitle}
              onChange={(e) =>
                setUpdateTask({ ...updateTask, newTitle: e.target.value })
              }
              placeholder="Task title"
              className="w-full mt-5 mb-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                setLoading({
                  ...loading,
                  updateTitle: true,
                });
                updateTaskTitle(
                  updateTask._id!,
                  updateTask.newTitle!,
                  updateTask.status
                );
              }}
              disabled={
                loading.updateTitle || updateTask.newTitle?.trim() === ""
              }
              className={`w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 hover:cursor-pointer ${
                loading.updateTitle || updateTask.newTitle?.trim() === ""
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading.updateTitle ? (
                <CircleDashed size={20} className="animate-spin" />
              ) : (
                <PlusCircle size={20} />
              )}
              Update Task
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default App;
