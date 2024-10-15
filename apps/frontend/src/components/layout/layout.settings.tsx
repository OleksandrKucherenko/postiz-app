'use client';

import { ReactNode, useCallback } from 'react';
import { Title } from '@gitroom/frontend/components/layout/title';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';
import { TopMenu } from '@gitroom/frontend/components/layout/top.menu';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { ToolTip } from '@gitroom/frontend/components/layout/top.tip';
import { ShowMediaBoxModal } from '@gitroom/frontend/components/media/media.component';
import Image from 'next/image';
import { Toaster } from '@gitroom/react/toaster/toaster';
import { ShowPostSelector } from '@gitroom/frontend/components/post-url-selector/post.url.selector';
import { OrganizationSelector } from '@gitroom/frontend/components/layout/organization.selector';
import NotificationComponent from '@gitroom/frontend/components/notifications/notification.component';
import Link from 'next/link';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import { ShowLinkedinCompany } from '@gitroom/frontend/components/launches/helpers/linkedin.component';
import { SettingsComponent } from '@gitroom/frontend/components/layout/settings.component';
import { Onboarding } from '@gitroom/frontend/components/onboarding/onboarding';
import { Support } from '@gitroom/frontend/components/layout/support';
import { ContinueProvider } from '@gitroom/frontend/components/layout/continue.provider';
import { CopilotKit } from '@copilotkit/react-core';
import { Impersonate } from '@gitroom/frontend/components/layout/impersonate';
import clsx from 'clsx';
import { BillingComponent } from '@gitroom/frontend/components/billing/billing.component';
import dynamic from 'next/dynamic';
import { NewSubscription } from '@gitroom/frontend/components/layout/new.subscription';
import { useVariables } from '@gitroom/react/helpers/variable.context';

import { ReactComponent as PostizSvg } from '@gitroom/frontend/assets/postiz.svg';
import { ReactComponent as GreenCheckSvg } from '@gitroom/frontend/assets/green-check.svg';

const ModeComponent = dynamic(
  () => import('@gitroom/frontend/components/layout/mode.component'),
  { ssr: false }
);

dayjs.extend(utc);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(isBetween);

export const LayoutSettings = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch();
  const { isGeneral } = useVariables();
  const { backendUrl, billingEnabled } = useVariables();
  const load = useCallback(async (path: string) => {
    return await (await fetch(path)).json();
  }, []);

  const { data: user } = useSWR('/user/self', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
  });

  if (!user) return null;

  return (
    <ContextWrapper user={user}>
      <CopilotKit
        credentials="include"
        runtimeUrl={backendUrl + '/copilot/chat'}
      >
        <ContextWrapper user={user}>
          <MantineWrapper>
            <ToolTip />
            <ShowMediaBoxModal />
            <ShowLinkedinCompany />
            <Toaster />
            <ShowPostSelector />
            <NewSubscription />
            {user.tier !== 'FREE' && <Onboarding />}
            <Support />
            <ContinueProvider />
            <div className="min-h-[100vh] w-full max-w-[1440px] mx-auto bg-primary px-[12px] text-textColor flex flex-col">
              {user?.admin && <Impersonate />}
              <div className="px-[23px] flex h-[80px] items-center justify-between z-[200] sticky top-0 bg-primary">
                <Link
                  href="/"
                  className="text-2xl flex items-center gap-[10px] text-textColor"
                >
                  <div className="min-w-[55px]">
                    <Image
                      src={isGeneral ? '/postiz.svg' : '/logo.svg'}
                      width={55}
                      height={53}
                      alt="Logo"
                    />
                  </div>
                  <div
                    className={clsx(!isGeneral ? 'mt-[12px]' : 'min-w-[80px]')}
                  >
                    {isGeneral ? <PostizSvg /> : 'Gitroom'}
                  </div>
                </Link>
                {user?.orgId &&
                (user.tier !== 'FREE' || !isGeneral || !billingEnabled) ? (
                  <TopMenu />
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-[8px]">
                  <ModeComponent />
                  <SettingsComponent />
                  <NotificationComponent />
                  <OrganizationSelector />
                </div>
              </div>
              <div className="flex-1 flex">
                <div className="flex-1 rounded-3xl px-[23px] py-[17px] flex flex-col">
                  {user.tier === 'FREE' && isGeneral && billingEnabled ? (
                    <>
                      <div className="text-center mb-[20px] text-xl">
                        <h1 className="text-3xl">
                          Join 1000+ Entrepreneurs Who Use Postiz
                          <br />
                          To Manage All Your Social Media Channels
                        </h1>
                        <br />
                        <div className="table mx-auto">
                          <div className="flex gap-[5px] items-center">
                            <div>
                              <GreenCheckSvg />
                            </div>
                            <div>100% no-risk trial</div>
                          </div>
                          <div className="flex gap-[5px] items-center">
                            <div>
                              <GreenCheckSvg />
                            </div>
                            <div>Pay nothing for the first 7 days</div>
                          </div>
                          <div className="flex gap-[5px] items-center">
                            <div>
                              <GreenCheckSvg />
                            </div>
                            <div>Cancel anytime, hassle-free</div>
                          </div>
                        </div>
                      </div>
                      <BillingComponent />
                    </>
                  ) : (
                    <>
                      <Title />
                      <div className="flex flex-1 flex-col">{children}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </MantineWrapper>
        </ContextWrapper>
      </CopilotKit>
    </ContextWrapper>
  );
};
