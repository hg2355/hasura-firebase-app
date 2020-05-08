import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import React, { useState, useEffect } from 'react'
import App from './App'
import { Container, Typography, Box, LinearProgress } from '@material-ui/core';

const provider = new firebase.auth.GoogleAuthProvider()

firebase.initializeApp({

})

export default function Auth() {
    const [authState, setAuthState] = useState({})

    useEffect(() => {
        return firebase.auth().onAuthStateChanged(user => {
            if (user) {
                return user.getIdToken().then((token) => firebase.auth().currentUser.getIdTokenResult()
                    .then((result) => {
                        if (result.claims['https://hasura.io/jwt/claims']) {
                            return token
                        }
                        const endpoint = 'https://us-central1-family-2355.cloudfunctions.net/refreshToken'
                        return fetch(`${endpoint}?uid=${user.uid}`).then((res) => {
                            if (res.status === 200) {
                                return user.getIdToken(true)
                            }
                            return res.json().then((e) => { throw e })
                        })
                    })).then((validToken) => {
                        // Store Token / Or create Apollo with your new token!
                        setAuthState({ status: "in", user, validToken });
                    }).catch(
                        setAuthState({ status: "out" }),
                        console.error,
                    )
            }
        });
    }, []);

    const signInWithGoogle = async () => {
        setAuthState({ status: 'loading' })
        try {
            await firebase.auth().signInWithRedirect(provider)
        } catch (error) {
            console.log(error)
        }
    }

    const signOut = async () => {
        try {
            setAuthState({ status: 'loading' })
            await firebase.auth().signOut()
            setAuthState({ status: 'out' })
        } catch (error) {
            console.log(error)
        }
    }

    let content
    if (authState.status === 'loading') {
        content = <LinearProgress />
    } else {
        content = (
            <>
                {authState.status === 'in' ? (
                    <Container>
                        <h2>Welcome, {authState.user.displayName}</h2>
                        <button onClick={signOut}>Sign out</button>
                        <App authState={authState} />
                    </Container>
                ) : (
                        <Container><button onClick={signInWithGoogle}>Sign in with Google</button></Container>
                    )}

            </>
        )
    }

    return <div className="auth">{content}</div>
}