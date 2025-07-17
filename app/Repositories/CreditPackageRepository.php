<?php

namespace App\Repositories;

use App\Models\CreditPackage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CreditPackageRepository
{
    protected $model;

    public function __construct(CreditPackage $model)
    {
        $this->model = $model;
    }

    public function getAll(): Collection
    {
        return $this->model->all();
    }

    public function getActive(): Collection
    {
        return $this->model->where('is_active', true)->get();
    }

    public function getPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->paginate($perPage);
    }

    public function findById(int $id): ?CreditPackage
    {
        return $this->model->find($id);
    }

    public function store(array $data): CreditPackage
    {
        return $this->model->create($data);
    }

    public function update(CreditPackage $creditPackage, array $data): bool
    {
        return $creditPackage->update($data);
    }

    public function delete(CreditPackage $creditPackage): bool
    {
        return $creditPackage->delete();
    }
}