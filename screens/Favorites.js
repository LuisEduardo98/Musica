import React, { useState, useCallback, useRef } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Button, Icon, Image } from 'react-native-elements'
import Toast from 'react-native-easy-toast'
import firebase from 'firebase/app'

import { getFavorites, deleteFavorite } from '../utils/actions'
import Loading from '../components/Loading'

export default function Favorites({navigation}) {
    const toastRef = useRef()
    const [musicas, setMusicas] = useState(null)
    const [userLogged, setUserLogged] = useState(false)
    const [loading, setLoading] = useState(false)
    const [reloadData, setReloadData] = useState(false)

    firebase.auth().onAuthStateChanged((user) => {
        user ? setUserLogged(true) : setUserLogged(false)
    })

    useFocusEffect(
        useCallback(() => { 
            if (userLogged){
               async function getData() {
                setLoading(true)
                const response = await getFavorites()
                setMusicas(response.favorites)
                setLoading(false)   
            }
            getData() 
            }
            setReloadData(false)
     }, [userLogged, reloadData])
    )

    if (!userLogged) {
        return <UserNoLogged navigation={navigation}/>
    }

    if (!musicas) {
        return <Loading isVisible={true} text="Cargando tiendas musica..."/>
    } else if(musicas?.length === 0){
        return <NotFoundRestaurants/>
    }


    return (
        <View style={styles.viewBody}>
            {
                musicas ? (
                <FlatList
                    data={musicas}
                    keyExtractor={(item, index) => index.toString() }
                    renderItem={(musica) => (
                        <Musica
                            musica={musica}
                            setLoading={setLoading}
                            toastRef={toastRef}
                            navigation={navigation}
                            setReloadData={setReloadData}
                        />
                    )}
                />
                ) : (
                    <View style={styles.loaderMusica}>
                        <ActivityIndicator size="large"/>
                        <Text style={{ textAlign: "center"}}>
                            Cargando Loacales de Musica...
                        </Text>
                    </View>
                )
            }
            <Toast ref={toastRef} position="center" opacity={0.9}/>
            <Loading isVisible={loading} text="Por favor espere..."/>
        </View>
    )
}

function Musica({musica, setLoading, toastRef, navigation, setReloadData}) {
    const { id, name, images} = musica.item

    const confirmRemoveFavorite = () => {
        Alert.alert(
            "Eliminar local de favorotos",
            "¿Está seguro de querer borrar el local de favoritos?",
            [
                {
                    text: "No",
                    style: "cancel"
                },
                {
                    text: "Sí",
                    onPress: removeFavorite
                }
            ],
            { cancelable: false }
        )
    }

    const removeFavorite = async() => {
        setLoading(true)
        const response = await deleteFavorite(id)
        setLoading(false)
        if (response.statusResponse) {
            setReloadData(true)
            toastRef.current.show("Local eliminado de favoritos.", 3000)
        } else {
            toastRef.current.show("Error al eliminar local de favoritos.", 3000)
        }
    }

    return(
        <View style={styles.musica}>
            <TouchableOpacity
                onPress={() => navigation.navigate("musica", {
                    screen: "musicau",
                    params: { id, name }
                })}
            >
                <Image
                    resizeMode="cover"
                    style={styles.image}
                    PlaceholderContent={<ActivityIndicator color="#fff"/>}
                    source={{ uri: images[0] }}
                />
                 <View style={styles.info}>
                 <Text style={styles.name}>{name}</Text>
                    <Icon
                        type="material-community"
                        name="account-heart"
                        color="#f00"
                        containerStyle={styles.favorite}
                        underlayColor="transparent"
                        onPress={confirmRemoveFavorite}
                    />
                 </View>
            </TouchableOpacity>
        </View>
    )
}

function NotFoundRestaurants() {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Icon type="material-community" name="alert-outline" size={50}/>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Aún no tienes locales favoritos.
            </Text>
        </View>
    )
}

function UserNoLogged({ navigation }) {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Icon type="material-community" name="alert-octagram" size={100}/>
            <Text style={{ fontSize: 60, fontWeight: "bold" }}>
                Necesitas estar logueado para ver los favoritos.
            </Text>
            <Button
                title="Ir al Login"
                containerStyle={{ marginTop: 20, width: "80%" }}
                buttonStyle={{ backgroundColor: "#442484" }}
                onPress={() => navigation.navigate("account", { screen: "login" })}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    viewBody: {
        flex: 1,
        backgroundColor: "#f2f2f2"
    },
    loaderMusica: {
        marginVertical: 10
    },
    musica: {
        margin: 10
    },
    image: {
        width: "100%",
        height: 180
    },
    info: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: -30,
        backgroundColor: "#fff"
    },
    name: {
        fontWeight: "bold",
        fontSize: 20
    },
    favorite: {
        marginTop: -35,
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 100
    } 
})
