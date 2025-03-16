import Link from 'next/link';
import styles from '../styles/Card.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className={styles.card}>
      <h3>{product.name}</h3>
      <p>السعر: {product.price} جنيه</p>
      <Link href={`/products/${product.id}`} className={styles.link}>تعديل المنتج</Link>
    </div>
  );
}
