import { useState, useRef, useEffect } from "react";
import type { FC } from "react";

interface Option {
  label: string;
  id: string;
}

interface DropdownProps {
  options: Option[];
  value: string;
  onSelect: (id: string) => void;
  placeholder?: string;
}

const Dropdown: FC<DropdownProps> = ({
  options,
  value,
  onSelect,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.id === value);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`dropdown ${isOpen ? "open" : ""}`} ref={dropdownRef}>
      <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
        {selectedOption ? selectedOption.label : placeholder}
        <span className="triangle-icon">{isOpen ? "▲" : "▼"}</span>
      </div>
      <ul className="dropdown-list">
        {options.map((option) => (
          <li
            key={option.id}
            onClick={() => {
              onSelect(option.id);
              setIsOpen(false);
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dropdown;
