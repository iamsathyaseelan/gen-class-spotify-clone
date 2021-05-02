import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';
import uuid from 'react-uuid'
import {
    Container,
    Table,
    TextField, Card,
    Paper,
    Typography,
    CardContent,
    TableCell, TableContainer, TableHead, TableRow, Button, Modal, Backdrop, Fade, CardMedia,
    TableBody
} from "@material-ui/core";
import {DateTime} from 'luxon';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import _ from 'lodash';
import Nav from "../components/nav";
import {SpotifyApiContext} from 'react-spotify-api'
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
    card: {
        display: 'flex',
    },
    cardDetails: {
        flex: 1,
    },
    cardMedia: {
        width: 300,
        height: 300,
    },
    trackCardMedia: {
        width: 100,
        height: 100,
    }, searchTrackCardMedia: {
        width: 50,
        height: 50,
    },
    container: {
        marginTop: 30
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        minWidth: 400
    },
}));

export default function Playlist() {
    let {playlistId} = useParams();
    const [loading, setLoading] = React.useState(false);
    const [playlist, setPlaylist] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [searchedTracks, setSearchedTracks] = useState([]);
    const [refreshCount, setRefreshCount] = useState(1);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const classes = useStyles();
    const token = React.useContext(SpotifyApiContext);
    const tracks = _.get(playlist, 'tracks.items', []);
    React.useEffect(() => {
        setLoading(true);
        axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {headers: {"Authorization": `Bearer ${token}`}}).then(response => {
            if (response.data) {
                setPlaylist(response.data)
            }
            setLoading(false);
        }).catch((e) => {
            console.log(e.message);
            setLoading(false);
        });
    }, [playlistId, token, refreshCount])
    const removeItemFromPlayList = (trackId) => {
        axios.delete(`https://api.spotify.com/v1/playlists/${playlistId}`, {headers: {"Authorization": `Bearer ${token}`}}).then(response => {
            if (response.data) {
                setPlaylist(response.data)
            }
            setLoading(false);
        }).catch((e) => {
            console.log(e.message);
            setLoading(false);
        });
    }
    const addItemToPlayList = (uri) => {
        axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            uris: [uri]
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).then(response => {
            console.log(response);
            setRefreshCount(refreshCount + 1)
        }).catch((e) => {
            console.log(e.message);
        });
    }
    const searchTracks = (keyword) => {
        if (keyword.length > 3) {
            axios.get(`https://api.spotify.com/v1/search?q=${keyword}&type=track&market=IN&limit=5`, {headers: {"Authorization": `Bearer ${token}`}}).then(response => {
                if (response.data) {
                    setSearchedTracks(response.data.tracks.items)
                }
            }).catch((e) => {
                console.log(e.message);
            });
        }
    }
    return (
        <div className={classes.root}>
            <Nav/>
            {!loading && <div>
                <div style={{}}>
                    <Card className={classes.card}>
                        <CardMedia className={classes.cardMedia}
                                   image={_.get(playlist, 'images.0.url', 'https://via.placeholder.com/150')}
                                   title={_.get(playlist, 'name', 'My Playlist')}/>
                        <div className={classes.cardDetails}>
                            <CardContent>
                                <p>
                                    {_.get(playlist, 'type', 'Playlist')}
                                </p>
                                <Typography component="h6" variant="h2">
                                    {_.get(playlist, 'name', 'My Playlist')}
                                </Typography>
                                <Typography variant="subtitle1" color="textSecondary">
                                    Created by: {_.get(playlist, 'owner.display_name', 'Your name')}
                                </Typography>
                                <Typography variant="subtitle1" paragraph>
                                    {_.get(playlist, 'description', '')}
                                </Typography>
                                <Typography variant="subtitle2" paragraph>
                                    Total songs :{tracks.length}
                                </Typography>
                                <Button variant='outlined' onClick={handleOpen}>Add more tracks</Button>
                            </CardContent>
                        </div>
                    </Card>
                </div>
                <Container className={classes.container}>
                    {tracks.length > 0 && <div>
                        <div style={{marginTop: 20, marginBottom: 20}}>
                            <Typography variant='h5'>Tracks</Typography>
                        </div>
                        <TableContainer component={Paper}>
                            <Table className={classes.table} aria-label="customized table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="left">Title</TableCell>
                                        <TableCell align="left">Album</TableCell>
                                        <TableCell align="left">Date Added</TableCell>
                                        <TableCell align="left">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tracks.map((track) => {
                                            let artists = [];
                                            let allArtists = _.get(track, 'track.album.artists', []);
                                            if (allArtists.length > 0) {
                                                allArtists.forEach((artist) => {
                                                    artists.push(_.get(artist, 'name', []))
                                                })
                                            }
                                            return (
                                                <TableRow key={uuid()}>
                                                    <TableCell align="left">
                                                        <div className={classes.card}>
                                                            <CardMedia className={classes.trackCardMedia}
                                                                       image={_.get(track, 'track.album.images.0.url', 'https://via.placeholder.com/150')}
                                                                       title={_.get(track, 'track.album.name', 'My Playlist')}/>
                                                            <div className={classes.cardDetails}>
                                                                <CardContent>
                                                                    <Typography component="h2" variant="h5">
                                                                        {_.get(track, 'track.album.name', 'My Playlist')}
                                                                    </Typography>
                                                                    <Typography variant="subtitle1" color="textSecondary">
                                                                        {artists.join(', ')}
                                                                    </Typography>
                                                                    <Typography variant="subtitle1" paragraph>
                                                                        <b>Release
                                                                            date:</b> {_.get(track, 'track.album.release_date', '')}
                                                                    </Typography>
                                                                </CardContent>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        <p>
                                                            {_.get(track, 'track.album.name', 'My Playlist')}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        {DateTime.fromMillis(new Date(_.get(track, 'added_at', Date.now())).getTime()).toLocaleString(DateTime.DATETIME_SHORT)}
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        <Button variant='outlined' onClick={() => {
                                                            removeItemFromPlayList(_.get(track, 'track.id', Date.now()));
                                                        }}>
                                                            <DeleteIcon/>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>}
                </Container>
            </div>}
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <div className={classes.paper}>
                        <form className={classes.root} noValidate autoComplete="off">
                            <TextField id="standard-basic" label="Search tracks" variant="outlined" fullWidth
                                       onChange={(event) => {
                                           searchTracks(event.target.value)
                                       }}/>
                        </form>
                        {searchedTracks.length > 0 && <Table className={classes.table} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left">Title</TableCell>
                                    <TableCell align="left">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {searchedTracks.map((track) => {
                                        let artists = [];
                                        let allArtists = _.get(track, 'album.artists', []);
                                        if (allArtists.length > 0) {
                                            allArtists.forEach((artist) => {
                                                artists.push(_.get(artist, 'name', []))
                                            })
                                        }
                                        return (
                                            <TableRow key={uuid()}>
                                                <TableCell align="left">
                                                    <div className={classes.card}>
                                                        <CardMedia className={classes.searchTrackCardMedia}
                                                                   image={_.get(track, 'album.images.0.url', 'https://via.placeholder.com/150')}
                                                                   title={_.get(track, 'album.name', 'My Playlist')}/>
                                                        <div className={classes.cardDetails}>
                                                            <div>
                                                                {_.get(track, 'album.name', 'My Playlist')}
                                                            </div>
                                                            <div>
                                                                {artists.join(', ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell align="left">
                                                    <Button variant='outlined' onClick={() => {
                                                        addItemToPlayList(_.get(track, 'uri', Date.now()));
                                                    }}>
                                                        <AddIcon/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                )}
                            </TableBody>
                        </Table>}
                    </div>
                </Fade>
            </Modal>
        </div>
    );
}
