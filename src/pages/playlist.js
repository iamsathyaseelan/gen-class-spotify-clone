import React from 'react';
import {useParams} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';
import {Container, ButtonGroup, Typography} from "@material-ui/core";
import {DateTime} from 'luxon';
import Card from '@material-ui/core/Card';
import DeleteIcon from '@material-ui/icons/Delete';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Paper from '@material-ui/core/Paper';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import _ from 'lodash';
import Nav from "../components/nav";
import {SpotifyApiContext} from 'react-spotify-api'
import axios from 'axios';
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
    card: {
        display: 'flex',
    },
    cardDetails: {
        flex: 1,
    },
    cardMedia: {
        width: 280,
        height: 280,
    }, trackCardMedia: {
        width: 100,
        height: 100,
    },
    container: {
        marginTop: 30
    },
}));

export default function Playlist() {
    let {playlistId} = useParams();
    const [loading, setLoading] = React.useState(false);
    const [playlist, setPlaylist] = React.useState({});
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
    }, [playlistId, token])
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
                                                <TableRow key={track.name}>
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
                                                        <Button variant='outlined' onClick={()=>{
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
        </div>
    );
}
