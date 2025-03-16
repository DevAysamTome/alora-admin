import styles from '../styles/Card.module.css';

interface Order {
  id: string;
  customer: string;
  total: number;
}

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <div className={styles.card}>
      <h3>طلب رقم {order.id}</h3>
      <p>العميل: {order.customer}</p>
      <p>المجموع: {order.total} جنيه</p>
    </div>
  );
}
