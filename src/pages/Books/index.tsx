import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Select from "react-select";
import { useAuth } from "../../context/AuthContext";
import api from "../../axios";

interface Section {
  id: string;
  name: string;
  pageNo: string | number;
  sections: Section[];
}

interface Book {
  id: number;
  name: string;
  collaborators: string[];
  userId: number;
  sections: Section[];
}

interface User {
  email: string;
}

const fetchBooks = async (): Promise<Book[]> => {
  const response = await api.get("/books");
  return response.data;
};

const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

const BooksList: React.FC = () => {
  const queryClient = useQueryClient();

  const [bookName, setBookName] = useState("");
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(
    []
  );
  const { user } = useAuth();

  const addBook = async (
    newBook: Omit<Book, "id" | "sections">
  ): Promise<Book> => {
    const response = await api.post("/books", {
      ...newBook,
      sections: [],
      userId: user?.id,
    });
    return response.data;
  };

  const {
    data: booksData,
    error: booksError,
    isLoading: booksLoading,
  } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: usersData,
    error: usersError,
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setBookName("");
      setSelectedCollaborators([]);
    },
    onError: (error) => {
      console.error("Error adding book:", error);
    },
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookName.trim() === "") return;

    mutation.mutate({
      name: bookName,
      collaborators: selectedCollaborators,
      userId: user?.id,
    });
  };

  if (booksLoading || usersLoading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  if (booksError || usersError) {
    return <div className="text-center text-red-500">Error loading data</div>;
  }

  const availableCollaborators = usersData?.filter(
    (userData) => userData.email !== user?.email
  );

  const collaboratorOptions = availableCollaborators?.map((userData) => ({
    value: userData.email,
    label: userData.email,
  }));

  const handleCollaboratorsChange = (selectedOptions: any) => {
    const emails = selectedOptions.map((option: any) => option.value);
    setSelectedCollaborators(emails);
  };

  const userBooks = booksData?.filter(
    (book) =>
      book.userId === user?.id || book.collaborators.includes(user?.email)
  );

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Books List
      </h1>

      <form
        onSubmit={handleAddBook}
        className="bg-blue-400 p-6 rounded-lg shadow-md mb-8"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 w-4/5">
            <input
              type="text"
              placeholder="Book Name"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 text-sm w-full"
              required
            />

            <Select
              isMulti
              options={collaboratorOptions}
              value={collaboratorOptions?.filter((option) =>
                selectedCollaborators.includes(option.value)
              )}
              onChange={handleCollaboratorsChange}
              className="w-full text-sm"
              classNamePrefix="select"
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold transition duration-300 ease-in-out text-sm"
          >
            Add Book
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userBooks?.map((book) => (
          <div
            key={book.id}
            className="border rounded-lg p-4 shadow-lg hover:shadow-xl transition duration-300 ease-in-out bg-white relative"
          >
            <div className="flex justify-between items-center mb-2">
              <Link to={`/books/${book.id}`}>
                <h2 className="text-xl font-semibold cursor-pointer hover:underline text-blue-700">
                  {book.name}
                </h2>
              </Link>
              <Link to={`/books/${book.id}`}>
                <button className="bg-blue-400 text-white px-3 py-1 rounded hover:bg-blue-600">
                  Edit
                </button>
              </Link>
            </div>
            <p className="text-gray-500 text-sm">
              Collaborators: {book.collaborators.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BooksList;
