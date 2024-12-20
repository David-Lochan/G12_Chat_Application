
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, FlatList, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import styles from './style';
import MessageBubble from '../../atoms/MessageBubble/Index';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SendMessage } from '../../../domain/SendMessage';
import { ChatRepository } from '../../../data/ChatRepository';
import LoadMessages from '../../../domain/LoadMessage';
import { generateAIResponse } from "../../../api/OneTap"
import { auth } from '../../../firebase/firebase';
// import { BlurView } from 'expo-blur';
import { ScrollView } from 'react-native';
import { Keyboard } from 'react-native';

const Chat = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { item, conversationId } = route.params;
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const flatListRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false); // State for full-screen image view
    const [isSuggestionBoxVisible, setIsSuggestionBoxVisible] = useState(false);
    // const [isBlurred, setIsBlurred] = useState(false); // State for blur effect
    const [response, setResponse] = useState("");
    const [responseLoader, setResponseLoader] = useState(false);


    const chatRepository = new ChatRepository();
    const loadMessagesUse = new LoadMessages(chatRepository);

    const sendMessage = () => {
        if (!text.trim()) return;
        SendMessage.execute(conversationId, item.id, text, 'text');
        setText('');
    };

    const handleSearchButtonClick = () => {
        setShowSearchBar(!showSearchBar);
        if (!showSearchBar) {
            setSearchQuery('');
        }
    };

    const filteredMessages = searchQuery.trim()
        ? messages.filter((message) =>
            message.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : messages;

    useEffect(() => {
        const unsubscribe = loadMessagesUse.execute(conversationId, setMessages);
        return () => {
            unsubscribe();
        };
    }, [conversationId]);

    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const renderMessage = ({ item }) => (
        <MessageBubble
            message={item.text}
            isOutgoing={item.sender_id === auth.currentUser.uid}
            timestamp={item.timestamp}
            status={item.msg_status}
            searchQuery={searchQuery}
        />
    );

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setIsFullScreen(false);
    };

    const closePartial = () => {
        setIsModalVisible(false);
    };

    const closeFull = () => {
        setIsFullScreen(false);
    };

    const handleResponse = (response) => {
        setText(response);
        // setIsBlurred(false);
        setIsSuggestionBoxVisible(false);
    }

    const handleSuggestions = async () => {
        if (text.trim() === '') return;
        setResponseLoader(true);
        try {
            // Generate AI response
            const aiResponse = await generateAIResponse(text);
            setResponse(aiResponse.trim());
            setIsSuggestionBoxVisible(!isSuggestionBoxVisible); // Toggle chat box visibility
            // setIsBlurred(!isBlurred);
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setResponseLoader(false);
    };

    return (
        <View style={styles.container}>
            {/* Apply BlurView when isBlurred is true
            {isBlurred && (
                <BlurView intensity={100} style={styles.backgroundBlur}>
                </BlurView>
            )} */}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <FontAwesome name="arrow-left" size={20} color="black" />
                </TouchableOpacity>

                {/* Profile Image */}
                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                    <Image
                        source={{ uri: item.profile_pic }}
                        style={styles.profilePic}
                    />
                </TouchableOpacity>

                {/* Header Text & Icons */}
                <TouchableOpacity
                    style={styles.headerContent}
                    onPress={() =>
                        navigation.navigate('UserProfileScreen', { profile: item })
                    }
                >
                    <View style={styles.headerText}>
                        <Text style={styles.profileName}>{item.name}</Text>
                        <Text style={styles.accountType}>{item.bio}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearchButtonClick}>
                        <FontAwesome name="search" size={23} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.audiocallButton}>
                        <FontAwesome name="phone" size={23} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.moreoptButton}>
                        <MaterialIcons name="more-vert" size={23} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Partial-Screen Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={handleCloseModal}

            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            onPress={closePartial}
                            style={styles.closeButtonProfile}
                        >
                            <FontAwesome name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: item.profile_pic }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.modalName}>{item.name}</Text>
                        {/* <TouchableOpacity
                            style={styles.fullScreenButton}
                            onPress={() => {
                                setIsModalVisible(false);
                                setIsFullScreen(true);
                            }}
                        >
                            <Text style={styles.fullScreenText}>View Full Screen</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </Modal>

            {/* Full-Screen Modal */}
            <Modal
                animationType="fade"
                visible={isFullScreen}
                transparent={true}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.fullScreenOverlay}>
                    <TouchableOpacity
                        onPress={closeFull}
                        style={styles.closeButtonFullScreen}
                    >
                        <FontAwesome name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: item.profile_pic }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>


            {/* Search Bar */}
            {showSearchBar && (
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search messages..."
                    onChangeText={(text) => setSearchQuery(text)}
                    value={searchQuery}
                />
            )}

            {/* Messages List */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <FlatList
                    ref={flatListRef}
                    data={filteredMessages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 90 }}
                />
            </KeyboardAvoidingView>

            {/* Chat Box triggered by bulb-outline button */}
            {isSuggestionBoxVisible && (
                <View style={[styles.SuggestionBox, { maxHeight: '40%' }]}>
                    <ScrollView>
                        <Text style={styles.SuggestionBoxText}>{response}</Text>
                    </ScrollView>
                    <View style={styles.SuggestionBoxButtons}>
                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => {
                                // Close the chat box and remove the blur effect
                                Keyboard.dismiss();
                                setIsSuggestionBoxVisible(false);
                                setIsBlurred(false); // Remove the blur when chat box is closed
                            }}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                        {/* OK Button */}
                        <TouchableOpacity
                            onPress={() => {
                                // Handle OK button action here
                                handleResponse(response);
                            }}
                            style={styles.okButton}
                        >
                            <Text style={styles.okButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Message Input */}
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.autocompleteButton}
                    onPress={handleSuggestions}
                >
                    {
                        responseLoader ? (
                            <ActivityIndicator size="small" color="#609d95" />
                        ) : (
                            <Ionicons name="bulb-outline" size={20} color="#609d95" />
                        )
                    }
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Message"
                    value={text}
                    onChangeText={setText}
                    placeholderTextColor="black"
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={sendMessage}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color="#609d95"
                        style={{ transform: [{ rotate: '-30deg' }] }}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraButton}>
                    <FontAwesome
                        name="camera"
                        size={20}
                        color="black"
                        style={styles.cameraIcon}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Chat;

