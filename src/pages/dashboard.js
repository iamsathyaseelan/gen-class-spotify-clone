import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Container, ButtonGroup, Typography} from "@material-ui/core";
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Button from '@material-ui/core/Button';
import Nav from "../components/nav";
import {SpotifyApiContext} from 'react-spotify-api'
import axios from 'axios';
import {Link} from "react-router-dom";
import _ from 'lodash'

const useStyles = makeStyles((theme) => ({
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    container: {
        marginTop: 30
    },
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        width: '100%',
    },
    icon: {
        color: 'rgba(255, 255, 255, 0.54)',
    },
}));

export default function Dashboard() {
    const [page, setPage] = React.useState(1);
    const [totalPlaylists, setTotalPlaylists] = React.useState(0);
    const [playlists, setPlaylists] = React.useState([]);
    const [totalPages, setTotalPages] = React.useState(1);
    const classes = useStyles();
    const token = React.useContext(SpotifyApiContext);
    React.useEffect(() => {
        axios.get('https://api.spotify.com/v1/me/playlists?limit=50', {headers: {"Authorization": `Bearer ${token}`}}).then(response => {
            let total = response.data.total;
            let totalPages = Math.ceil(total / 50);
            if (response.data.items && Array.isArray(response.data.items)) {
                setPlaylists(response.data.items)
            }
            setTotalPages(totalPages)
            setTotalPlaylists(total);
        }).catch((e) => {
            console.log(e.message)
        });
    }, [token, page])
    return (
        <div className={classes.root}>
            <Nav/>
            <Container className={classes.container}>
                <Typography variant="h5" component="h2">
                    My Playlists <br/><small style={{fontSize: 14}}>Total {totalPlaylists} playlist(s) found</small>
                </Typography>
                <br/>
                <div>
                    <GridList cellHeight={400} spacing={10} cols={4} className={classes.gridList}>
                        {playlists.map((playlist) => {
                            let image = _.get(playlist,'images.0.url','https://via.placeholder.com/150');
                            return <GridListTile key={playlist.id}>
                                <Link to={`/playlist/${playlist.id}`}>
                                    <img src={image} alt={playlist.name}/>
                                    <GridListTileBar
                                        title={playlist.name}
                                        subtitle={<span>by: {playlist.owner.display_name}</span>}
                                        actionIcon={
                                            <IconButton aria-label={`info about ${playlist.name}`}
                                                        className={classes.icon}>
                                                <VisibilityIcon/>
                                            </IconButton>
                                        }
                                    />
                                </Link>
                            </GridListTile>
                        })}
                    </GridList>
                </div>
                <ButtonGroup variant="text" color="primary" aria-label="text primary button group">
                    <Button onClick={() => {
                        setPage(page - 1);
                    }} disabled={(page === 1)}>Previous Page</Button>
                    <Button onClick={() => {
                        setPage(page + 1);
                    }} disabled={(page === totalPages)}>Next Page</Button>
                </ButtonGroup>
            </Container>
        </div>
    );
}
