const colors = { Delivered:{background:'#E4F7F4',color:'#0C8C6B'},'In transit':{background:'#E8EFFE',color:'#2453B8'},'Out for delivery':{background:'#FCEFD6',color:'#8A5A05'},Delayed:{background:'#FDE9E7',color:'#B23528'},Failed:{background:'#FDE9E7',color:'#B23528'},Pending:{background:'#FCEFD6',color:'#8A5A05'} };
export function getStatusColors(status){return colors[status]||{background:'#F0F2F6',color:'#697086'};}
export default colors;
