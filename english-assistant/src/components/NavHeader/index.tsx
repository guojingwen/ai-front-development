import { Button, Popover } from '@mantine/core';
import { IconDotsVertical } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import AssistantSelect from '../AssistantSelect';
import { ThemeSwitch } from '../ThemeSwitch';
import { Assistant } from '@/types';
import Setting from '../Setting';

type Props = {
  assistantId: string;
  onAssistantChange: (value: Assistant) => void;
};
export default function NavHeader({
  assistantId,
  onAssistantChange,
}: Props) {
  return (
    <div className='flex w-full justify-between items-center p-4 shadow-sm h-[6rem]'>
      <Popover width={100} position='bottom' withArrow shadow='sm'>
        <Popover.Target>
          <Button
            size='small'
            variant='subtle'
            className='px-1'
            rightIcon={<IconDotsVertical size='1rem' />}>
            AI助理
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Link
            to='/assistant'
            className='no-underline text-green-600'>
            助理管理
          </Link>
        </Popover.Dropdown>
      </Popover>
      <AssistantSelect
        value={assistantId}
        onChange={onAssistantChange}
      />
      <div className='flex w-12 flex-row justify-between items-center'>
        <ThemeSwitch></ThemeSwitch>
        <Setting></Setting>
      </div>
    </div>
  );
}
