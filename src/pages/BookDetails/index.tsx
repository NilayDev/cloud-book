import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
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

const fetchBookDetail = async (id: number): Promise<Book> => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

const saveBookDetail = async (book: Book): Promise<Book> => {
  const response = await api.put(`/books/${book.id}`, book);
  return response.data;
};

const filterEmptySections = (sections: Section[]): Section[] => {
  return sections
    .filter(
      (section) =>
        section.name.trim() !== "" || section.pageNo.toString().trim() !== ""
    )
    .map((section) => ({
      ...section,
      sections: filterEmptySections(section.sections),
    }));
};

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(
    []
  );
  const [showNotification, setShowNotification] = useState(false);

  const {
    data: bookData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["bookDetail", id],
    queryFn: () => fetchBookDetail(Number(id)),
  });

  const isAuthor = user && bookData && user.id === bookData.userId;

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const availableUsers = usersData?.filter(
    (userData) => userData.email !== user.email
  );

  const { register, control, handleSubmit, reset } = useForm<Book>({
    defaultValues: bookData,
  });

  const { fields, append } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    if (bookData) {
      reset(bookData);
      setSelectedCollaborators(bookData.collaborators);
    }
  }, [bookData, reset]);

  const mutation = useMutation<Book, Error, Book>({
    mutationFn: async (updatedBook: Book) => {
      const response = await saveBookDetail(updatedBook);
      return response;
    },
    onSuccess: () => {
      setShowNotification(true);
      setIsEditing(false);
      setTimeout(() => setShowNotification(false), 3000);
      navigate("/books");
    },
    onError: (error) => {
      console.error("Saving book failed:", error.message);
    },
  });

  const onSubmit = (formData: Book) => {
    const filteredData: Book = {
      ...formData,
      sections: filterEmptySections(formData.sections),
      collaborators: selectedCollaborators,
    };
    mutation.mutate(filteredData);
  };

  const handleCollaboratorsChange = (selectedOptions: any) => {
    const selectedEmails = selectedOptions.map((option: any) => option.value);
    setSelectedCollaborators(selectedEmails);
  };

  const SectionComponent: React.FC<{
    section: Section;
    sectionIndex: number;
    parentName: string;
  }> = ({ section, sectionIndex, parentName }) => {
    const { fields: nestedSections, append: appendNestedSection } =
      useFieldArray({
        control,
        name: `${parentName}.${sectionIndex}.sections` as const,
      });

    return (
      <div className="ml-4 mb-4">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <input
                {...register(`${parentName}.${sectionIndex}.name` as any)}
                className="border p-1 rounded w-1/3 bg-white border-gray-300 shadow-sm focus:ring focus:ring-indigo-300 focus:border-indigo-500"
                placeholder="Section Name"
              />
              <input
                {...register(`${parentName}.${sectionIndex}.pageNo` as any)}
                className="border p-1 rounded w-1/6 bg-white border-gray-300 shadow-sm focus:ring focus:ring-indigo-300 focus:border-indigo-500"
                placeholder="Page No"
                type="number"
              />
              {isAuthor && (
                <button
                  className="bg-indigo-600 text-white px-3 py-1 rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 ease-in-out"
                  type="button"
                  onClick={() =>
                    appendNestedSection({
                      id: Date.now().toString(),
                      name: "",
                      pageNo: "",
                      sections: [],
                    })
                  }
                >
                  Add Subsection
                </button>
              )}
            </>
          ) : (
            <div className="bg-gray-100 p-3 rounded-lg shadow-inner w-full">
              <p className="w-1/3 font-semibold">
                {section.name || "Untitled Section"}
              </p>
              <p className="w-1/6">{section.pageNo}</p>
            </div>
          )}
        </div>

        {nestedSections.length > 0 && (
          <div className="ml-4 mt-2 border-l-2 border-indigo-300 pl-4">
            {nestedSections.map((subSection, subIndex) => (
              <SectionComponent
                key={subSection.id}
                section={subSection}
                sectionIndex={subIndex}
                parentName={`${parentName}.${sectionIndex}.sections`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center text-xl text-gray-600">
        Loading book details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">Error loading book details</div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-lg relative">
      {showNotification && (
        <div className="fixed top-0 left-0 w-full bg-green-600 text-white p-3 shadow-md text-center">
          Book details saved successfully!
        </div>
      )}

      <div className="sticky top-0 bg-white p-4 shadow-md rounded-lg flex justify-between items-center z-10 mb-6">
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        {!isEditing ? (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        ) : (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
            onClick={handleSubmit(onSubmit)}
          >
            Save
          </button>
        )}
      </div>

      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
        {bookData?.name}
      </h1>

      {
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-700">
            Collaborators:
          </h3>
          {isEditing && isAuthor ? (
            <Select
              isMulti
              options={availableUsers?.map((user) => ({
                label: user.email,
                value: user.email,
              }))}
              value={selectedCollaborators.map((email) => ({
                label: email,
                value: email,
              }))}
              onChange={handleCollaboratorsChange}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          ) : (
            <div className="bg-gray-100 p-3 rounded-lg shadow-inner">
              <p className="text-gray-600 text-lg">
                {bookData?.collaborators.join(", ")}
              </p>
            </div>
          )}
        </div>
      }

      <h3 className="font-semibold text-2xl text-gray-700 mb-4">Sections:</h3>

      {isAuthor && isEditing && (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-green-700 transition duration-200"
          onClick={() =>
            append({
              id: Date.now().toString(),
              name: "",
              pageNo: "",
              sections: [],
            })
          }
        >
          Add Section
        </button>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          {fields.map((section, index) => (
            <SectionComponent
              key={section.id}
              section={section}
              sectionIndex={index}
              parentName="sections"
            />
          ))}
        </div>
      </form>
    </div>
  );
};

export default BookDetail;
