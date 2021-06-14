import { useIsMobile } from '@/hooks/useIsMobile';
import { SubmittedTweet, User } from '@/types';
import {
  Avatar,
  Box,
  IconButton,
  Link,
  Typography,
  makeStyles,
} from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';

export type TweetListProps = {
  tweets: SubmittedTweet[];
  users: User[];
  onDelete: (id: string) => void;
};

const useStyles = makeStyles(({ spacing, breakpoints }) => ({
  linkAvatar: {
    height: spacing(3),
    width: spacing(3),
    marginRight: spacing(1),
  },
  linkBox: {
    [breakpoints.down('sm')]: {
      justifyContent: 'space-around',
    },
  },
}));

const TweetList: React.FC<TweetListProps> = ({ tweets, users, onDelete }) => {
  const classes = useStyles();
  const isMobile = useIsMobile();
  if (!tweets.length) {
    return <></>;
  }
  return (
    <Box mt={2} display="flex" flexDirection="column">
      {tweets.map(({ id, authorId }) => {
        const { screenName, image } =
          users.find(({ id }) => id === authorId) || {};
        const link = `twitter.com/${screenName}/status/${id}`;
        return (
          <Box className={classes.linkBox} display="flex" alignItems="center">
            <Avatar className={classes.linkAvatar} src={image!}>
              {screenName?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
            <Link href={`https://${link}`} target="_blank">
              <Typography variant="inherit">
                {isMobile ? `...${link.substring(20)}` : link}
              </Typography>
            </Link>
            <IconButton onClick={() => onDelete(id)} size="small">
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
};

export default TweetList;
