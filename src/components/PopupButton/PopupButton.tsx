import React, {FC, useEffect, useRef} from "react";
import styles from "./PopupButton.module.scss";

declare interface PopupButtonProps {
    children?: any,
    callback: Function,
    className: any,
}

const PopupButton: FC<PopupButtonProps> = (props) => {

    /**
     * Hook that alerts clicks outside of the passed ref
     */
    function useOutsideAlerter(ref: any) {
        useEffect(() => {
            /**
             * Alert if clicked on outside of element
             */
            function handleClickOutside(event: any) {
                if (ref.current && !ref.current.contains(event.target)) {
                    props.callback(false)
                }
            }

            // Bind the event listener
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                // Unbind the event listener on clean up
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref])
    }

    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef);
    return (
        <div className={`${styles.PopupButton} ${props.className}`} ref={wrapperRef}>
            { props.children }
        </div>
    )
}

export default PopupButton;
