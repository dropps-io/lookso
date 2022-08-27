import React, {FC, useState} from "react";
import styles from "./SidebarButtons.module.scss";
import returnIcon from "../../assets/icons/return.svg";
import newPostIcon from "../../assets/icons/newpostsvg.svg";
import {FeedPost} from "../PostBox/PostBox";
import {useRouter} from "next/router";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import PostModal from "../Modals/PostModal/PostModal";
import StickyButton from "../StickyButton/StickyButton";


declare interface SidebarButtonsProps {
    disableEdit?: boolean
}

const SidebarButtons: FC<SidebarButtonsProps> = (props) => {

    const router = useRouter()

    const connected = {
        account: useSelector((state: RootState) => state.web3.account),
        username: useSelector((state: RootState) => state.profile.name),
        profileImage: useSelector((state: RootState) => state.profile.profileImage),
        backgroundImage: useSelector((state: RootState) => state.profile.backgroundImage),
    }

    const [showPostModal, setShowPostModal] = useState(false);

    /**
     * When user click on StickyButton to get the previous page
     */
    function onClickReturn() {
        router.back()
    }

    /**
     * When user click on StickyButton to create a new post
     */
    async function onClickNewPost() {
        if (!connected.account) setShowPostModal(true);
        else setShowPostModal(true);
    }

    /**
     * When user close the post modal
     * 1 - Close if not post wrote
     * 2 - Save post and close
     * @param newPost
     */
    function onClickClosePostModal(newPost?: FeedPost) {
        setShowPostModal(false);

        if (!connected.account) return;
        // TODO create a new post
    }

    return (
        <div className={styles.SidebarButtons}>
            <PostModal open={showPostModal} onClose={onClickClosePostModal}/>
            <StickyButton icon={returnIcon} alt={"Return"} callback={onClickReturn} color={"--color-background-main-l3"}/>
            {
                !props.disableEdit && <StickyButton icon={newPostIcon} alt={"New post"} callback={onClickNewPost} color={"--color-buttons"}/>
            }
        </div>
    )
}

export default SidebarButtons;
