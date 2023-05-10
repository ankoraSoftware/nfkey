import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface ISelectProps {
  options: any;
  containerStyle?: string;
  value: any;
  setValue: (value: any) => void;
  icon?: any;
  listStyle?: string;
  selectStyle?: string;
  disabled?: boolean;
  errorMessage?: string;
}

const Select = ({
  value,
  options,
  containerStyle,
  selectStyle,
  listStyle,
  setValue,
  icon,
  errorMessage,
  disabled = false,
}: ISelectProps) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOptionsOpen(false);
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target as Node)
    ) {
      setIsOptionsOpen(false);
    }
  };

  return (
    <div>
      <div
        className={`w-full ${
          errorMessage ? "border border-error rounded-lg" : containerStyle
        }  relative flex flex-col 
      ${disabled && "bg-gray-700 cursor-not-allowed border-none"}`}
        ref={selectRef}
      >
        <div
          className={`${selectStyle} w-full  p-3 flex items-center justify-between 
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        `}
          onClick={() => !disabled && setIsOptionsOpen(!isOptionsOpen)}
        >
          <span className="flex items-center text-sm">
            {value?.image && (
              <Image
                className="mr-2 object-contain h-4 w-auto grayscale"
                src={value?.image}
                width={20}
                height={20}
                alt="symbol"
              />
            )}
            <p className="font-medium text-black">
              {typeof value === "string" ? value : value?.value}
            </p>
          </span>
          {icon && icon}
        </div>
        {isOptionsOpen && options.length > 0 && (
          <div
            className={`${listStyle} w-full absolute top-[53px] z-50 flex flex-col overflow-hidden`}
          >
            {options.map((option: any) => {
              return (
                <p
                  key={option.id}
                  onClick={() => {
                    if (option.tokenId !== undefined || option?.image) {
                      setValue(option);
                    } else {
                      setValue(option.value);
                    }
                    setIsOptionsOpen(false);
                  }}
                  className={`p-2 text-start cursor-pointer hover:bg-gray-200 w-full ${
                    option.value === value ? "text-orange-500" : "text-black"
                  }`}
                >
                  <span className="flex">
                    {option?.image && (
                      <Image
                        className="mr-2 object-contain h-4 w-auto"
                        src={option?.image}
                        width={20}
                        height={20}
                        alt="symbol"
                      />
                    )}
                    {option.value}
                  </span>
                </p>
              );
            })}
          </div>
        )}
        {isOptionsOpen && !options.length && (
          <div
            className={`${listStyle} w-full absolute top-[53px] z-50 flex flex-col gap-2 overflow-hidden p-2`}
          >
            There is no more options
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="text-sm text-error leading-5 mt-2">{errorMessage}</p>
      )}
    </div>
  );
};
export default Select;
