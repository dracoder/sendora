<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class SearchableIndex
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $modelName): Response
    {
        if ($request->header('Accept') === 'text/json') {
            $model = "App\\Models\\$modelName";
            $page = $request->query('page', 1);
            $limit = $request->query('limit', 10);
            $order = $request->query('order', 'asc');
            $orderBy = $request->query('orderBy', 'id');

            $relationships = $request->query('relationships');
            $filters = json_decode($request->query('filters'), true) ?? [];
            $searchKeys = $request->query('searchKeys', null);
            $searchInput = $request->query('searchInput', null);

            $query = $model::query();

            if ($filters) {
                foreach ($filters as $index => $filter) {
                    if (!isset($filter['values']) || ($filter['values'] === null || $filter['values'] === '')) {
                        continue;
                    }
                    switch ($filter['type']) {
                        case 'asyncSelect':
                            $ids = [];
                            foreach ($filter['values'] as $filterValue) {
                                $ids[] = is_array($filterValue) ? $filterValue['value'] : $filterValue;
                            }
                            $query->whereIn($index, $ids);
                            break;
                        case 'select':
                            $query->where($index, $filter['values']);
                            break;
                        case 'dateRange':
                            $query->whereBetween($index, explode('__', $filter['values']));
                            break;
                        default:
                            $query->where($index, 'like', '%' . $filter['values'] . '%');
                    }
                }
            }

            if ($relationships) {
                $query->with(explode(',', $relationships));
            }

            if ($searchKeys && $searchInput) {
                $query->where(function ($query) use ($searchKeys, $searchInput) {
                    foreach (explode(',', $searchKeys) as $column) {
                        if (str_contains($column, '.')) { // for a relationship
                            $keys = explode('.', $column);
                            $relation = $keys[0];
                            $relationColumn = $keys[1];

                            $query->orWhereHas($relation, function ($query) use ($relationColumn, $searchInput) {
                                if ($relationColumn === 'full_name') {
                                    $query->whereLike(DB::raw("CONCAT(first_name, ' ', last_name)"), '%' . $searchInput . '%');
                                } else {
                                    $query->whereLike($relationColumn, '%' . $searchInput . '%');
                                }
                            });
                        } else {
                            if ($column === 'full_name') {
                                $query->orWhereLike(DB::raw("CONCAT(first_name, ' ', last_name)"), '%' . $searchInput . '%');
                            } else {
                                $query->orWhereLike($column, '%' . $searchInput . '%');
                            }
                        }
                    }
                });
            }

            $countQuery = clone $query;
            $count = $countQuery->getQuery()->getCountForPagination();

            $query->orderBy($orderBy, $order);

            $data = $query->forPage($page, $limit)->get();
            $totalPages = ceil($count / $limit);

            $meta = [
                'totalPages' => $totalPages,
                'currentPage' => $page,
                'totalItems' => $count,
            ];

            if ($request->has('resource') && ($request->input('resource') === true || $request->input('resource') === 'true')) {
                $data = new ("App\\Http\\Resources\\" . $modelName . "Collection")($data);
            }

            return response()->json([
                'data' => $data,
                'meta' => $meta,
            ]);
        }

        return $next($request);
    }
}
