import { useIsMobile } from '@/hooks/useIsMobile';
import { Campaign } from '@/types';
import { fetchJson } from '@/util';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  makeStyles,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import SearchIcon from '@material-ui/icons/Search';
import dynamic from 'next/dynamic';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import CampaignListItem from './CampaignListItem';
import Section from './Section';

const CampaignDialog = dynamic(() => import('./CampaignDialog'), {
  ssr: false,
});
const ConfirmDialog = dynamic(() => import('./ConfirmDialog'), { ssr: false });

export type CampaignListProps = {
  className?: string;
};

const useStyles = makeStyles(({ spacing }) => ({
  item: {
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  searchField: {
    margin: spacing(0, 3),
    maxWidth: '200px',
  },
  searchIcon: {
    pointerEvents: 'none',
    cursor: 'pointer',
  },
}));

const CampaignList: React.FC<CampaignListProps> = ({ className }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile({ breakpoint: 'sm' });
  const [searchValue, setSearchValue] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [deleteRecord, setDeleteCampaign] = useState<Campaign | null>(null);
  const { data, revalidate, mutate } = useSWR<Campaign[]>(
    `/api/campaigns?search=${searchValue}`,
    fetchJson
  );
  const { enqueueSnackbar } = useSnackbar();

  const handleSaveCampaign = async ({
    influencers,
    managers,
    ...campaign
  }: Campaign) => {
    setIsDialogLoading(true);

    const saveCampaign: Campaign = {
      ...campaign,
      influencers: influencers?.map(({ id }) => ({
        id,
      })),
      managers: managers?.map(({ id }) => ({
        id,
      })),
    };

    const { ok, status } = await fetch('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(saveCampaign),
    });

    if (ok) {
      setShowNewDialog(false);
      setEditCampaign(null);
      enqueueSnackbar(
        status === 201 ? t('new_campaign_added') : t('campaign_updated'),
        { variant: 'success' }
      );
      // Fetch updated campaigns
      await revalidate();
    } else {
      enqueueSnackbar(t('an_error_occurred'), { variant: 'error' });
    }
    setIsDialogLoading(false);
  };

  const handleDeleteCampaign = async () => {
    if (!deleteRecord) {
      return;
    }
    setIsDialogLoading(true);

    const { ok } = await fetch(`/api/campaigns/${String(deleteRecord._id)}`, {
      method: 'DELETE',
    });
    if (ok) {
      setDeleteCampaign(null);
      enqueueSnackbar(t('campaign_deleted'), { variant: 'success' });
      // Fetch updated campaigns
      await revalidate();
    } else {
      enqueueSnackbar(t('an_error_occurred'), { variant: 'error' });
    }
    setIsDialogLoading(false);
  };

  return (
    <>
      <Section
        title={t('campaigns')}
        titleAdornment={
          <Box display="flex" justifyContent="flex-end" flexBasis="50%">
            <TextField
              variant="outlined"
              className={classes.searchField}
              onClick={(e) => e.stopPropagation()}
              size="small"
              value={searchValue}
              onChange={({ target: { value } }) => setSearchValue(value)}
              InputProps={{
                endAdornment: !searchValue ? (
                  <SearchIcon fontSize="small" className={classes.searchIcon} />
                ) : (
                  <CancelIcon
                    onClick={() => setSearchValue('')}
                    fontSize="small"
                    style={{ cursor: 'pointer' }}
                  />
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                setShowNewDialog(true);
              }}
            >
              <AddIcon />
              {isMobile ? t('new') : t('new_campaign')}
            </Button>
          </Box>
        }
        badgeNumber={data?.length || 0}
        className={className}
      >
        <Grid container direction="column" spacing={2}>
          {!data ? (
            <CircularProgress style={{ margin: 'auto' }} />
          ) : data.length === 0 ? (
            t('no_campaigns')
          ) : (
            data.map((campaign) => (
              <Grid item className={classes.item} key={String(campaign._id)}>
                <CampaignListItem
                  campaign={campaign}
                  mutate={mutate}
                  setDeleteCampaign={setDeleteCampaign}
                  setEditCampaign={setEditCampaign}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Section>
      {(showNewDialog || editCampaign) && (
        <CampaignDialog
          open
          isLoading={isDialogLoading}
          campaign={editCampaign}
          onSave={handleSaveCampaign}
          onClose={() => {
            setEditCampaign(null);
            setShowNewDialog(false);
          }}
        />
      )}
      {deleteRecord && (
        <ConfirmDialog
          open
          title={t('delete_name', { name: deleteRecord.name })}
          confirmText="Delete"
          onClose={() => setDeleteCampaign(null)}
          onConfirm={handleDeleteCampaign}
          isLoading={isDialogLoading}
        />
      )}
    </>
  );
};
export default CampaignList;
