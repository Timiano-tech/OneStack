import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { toast } from '../components/Toast';
import { LISTING_CATEGORIES, SERVICE_CATEGORIES, type Condition, type Listing } from '../types';
import { createListing } from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'for_parts', label: 'For parts' },
];

export function CreateListing() {
  const router = useRouter();
  const { user } = useAuth();
  const [type, setType] = useState<'sell' | 'buy' | 'service'>('sell');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState<Condition>('good');
  const [location, setLocation] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = type === 'service' ? SERVICE_CATEGORIES : LISTING_CATEGORIES;

  const setTypeAndClearCategory = (t: 'sell' | 'buy' | 'service') => {
    setType(t);
    setCategory(''); // Reset so category matches new type options
    if (errors.category) setErrors((e) => ({ ...e, category: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (imageFiles.length + files.length > 5) {
      toast.error('Maximum 5 images allowed.');
      return;
    }

    const newUrls = files.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...files]);
    setImageUrls(prev => [...prev, ...newUrls]);
    clearError('images')();
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!description.trim()) next.description = 'Description is required';
    const priceNum = Number(price);
    if (price === '' || price === null || Number.isNaN(priceNum) || priceNum < 0) {
      next.price = 'Enter a valid price (0 or more)';
    }
    if (!category) next.category = 'Category is required';
    if (!location.trim()) next.location = 'Location is required';
    if (imageFiles.length === 0) next.images = 'Add at least one image';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const clearError = (field: string) => () => {
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }
    setLoading(true);
    try {
      const listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        type,
        title,
        description,
        price: Number(price),
        currency: 'USD',
        category: category as any,
        condition: type === 'service' ? undefined : condition,
        images: [], // Will be filled by service
        location,
        campusId: user.campusId || '',
        universityId: user.universityId || '',
        isPremium,
        status: 'active',
      };

      await createListing(listingData, imageFiles);
      toast.success('Listing created!');
      router.push('/listings');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create listing. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-900">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create listing</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Sell an item, request to buy, or offer a service.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Type
            </label>
            <div className="flex gap-2">
              {(['sell', 'buy', 'service'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeAndClearCategory(t)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                    type === t
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Title"
            placeholder="e.g. MacBook Pro 14 inch M3"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError('title')();
            }}
            error={errors.title}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              placeholder="Describe your item or service..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearError('description')();
              }}
              rows={4}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-slate-100 ${
                errors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Price (USD)"
              type="number"
              min={0}
              step={0.01}
              placeholder="0"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                clearError('price')();
              }}
              error={errors.price}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  clearError('category')();
                }}
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.category ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                }`}
              >
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1.5 text-sm text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          {type !== 'service' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Condition
              </label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCondition(c.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      condition === c.value
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Input
            label="Location (e.g. North Campus, Dorm 12)"
            placeholder="Where to meet / provide service"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              clearError('location')();
            }}
            error={errors.location}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Photos (max 5)
            </label>
            <div className="flex flex-wrap gap-3">
              {imageUrls.map((url, i) => (
                <motion.div
                  key={i}
                  layout
                  className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                  >
                    <FiX size={14} />
                  </button>
                </motion.div>
              ))}
              {imageUrls.length < 5 && (
                <label
                  className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-emerald-400 hover:text-emerald-500 dark:border-slate-600 dark:hover:border-emerald-600"
                >
                  <FiUpload size={28} />
                  <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
                </label>
              )}
            </div>
            {errors.images && (
              <p className="mt-1.5 text-sm text-red-500">{errors.images}</p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Boost visibility (Premium only) — feature at top of feed
            </span>
          </label>

          <p className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Free: 3 active listings. <Link href="/pricing" className="font-medium text-emerald-600 dark:text-emerald-400">Upgrade to Premium</Link> for unlimited listings and boosts.
          </p>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Publish
            </Button>
          </div>
        </form>
      </div>
    </AnimatedPage>
  );
}
