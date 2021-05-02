import React from 'react'
import {SpotifyApiContext} from 'react-spotify-api'
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import Cookies from 'js-cookie'
import Login from './pages/login'
import 'react-spotify-auth/dist/index.css'
import Dashboard from "./pages/dashboard";
import Playlist from "./pages/playlist";

const App = () => {
    const token = Cookies.get('spotifyAuthToken')
    console.log(token)
    if (!token) {
        return <Login/>
    }
    return (
        <div className='app'>
            <Router>
                <SpotifyApiContext.Provider value={token}>
                    <Switch>
                        <div>
                            <Route exact={true} path="/playlist/:playlistId">
                                <Playlist/>
                            </Route>
                            <Route exact={true} path="/">
                                <Dashboard/>
                            </Route>
                        </div>
                    </Switch>
                </SpotifyApiContext.Provider>
            </Router>
        </div>
    )
}
export default App
