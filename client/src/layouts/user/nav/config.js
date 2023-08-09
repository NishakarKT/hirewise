// component
import SvgColor from '../../../components/svg-color';

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  // users
  {
    title: 'Jobs',
    path: '/user/jobs',
    icon: icon('ic_user'),
  },
  {
    title: 'Interviews',
    path: '/user/interviews',
    icon: icon('ic_blog'),
  },
];

export default navConfig;
